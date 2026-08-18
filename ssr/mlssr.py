import socket

def check_connection(ip_address, port=1433, timeout=3):
    try:
        # Mencoba membuka koneksi TCP ke IP dan Port tujuan
        with socket.create_connection((ip_address, port), timeout=timeout):
            print("Koneksi ke database aman!")
            return True
    except OSError:
        print("Server tidak merespon / port tertutup!")
        return False

# Panggil fungsi ini di awal file mlssr.py menggantikan subprocess.run

# In[3]:

import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()


# 1. KONFIGURASI KONEKSI DATABASE
server_name = os.getenv("DATABASE_SERVER") 
database_name = os.getenv("DATABASE_NAME")
username = os.getenv("DATABASE_USERNAME")
password = os.getenv("DATABASE_PASSWORD")


# Jika menggunakan Windows Authentication (tanpa password):
# connection_string = f"mssql+pyodbc://{username}:{password}@{server_name}/{database_name}?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=yes"

# engine = create_engine(connection_string)

# print("Berhasil terhubung ke SQL Server! Mulai menarik data...")

import polars as pl

db_url = f"mssql+pyodbc://{username}:{password}@{server_name}/{database_name}?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=yes"
engine = create_engine(db_url)
print("Fetching data")

failure_query = "SELECT * FROM ssrlogs.failure_summary"
try:
    print("Failure summary...")
    # Membaca jauh lebih cepat dari Pandas
    df_failure_polars = pl.read_database_uri(failure_query, db_url)
    
    # Kalau kamu tetap butuh format Pandas untuk script ML yang lama:
    df_failure = df_failure_polars.to_pandas() 
    
    print("Failure Summary Done! (Polars Engine)")
except Exception as e:
    print(f"Error fetching data: {e}")

azimuth_query = "SELECT * FROM ssrlogs.azimuth"
try:
    print("azimuth...")
    # Membaca jauh lebih cepat dari Pandas
    df_azimuth_polars = pl.read_database_uri(azimuth_query, db_url)
    
    # Kalau kamu tetap butuh format Pandas untuk script ML yang lama:
    df_azimuth = df_azimuth_polars.to_pandas() 
    
    print("Azimuth Done! (Polars Engine)")
except Exception as e:
    print(f"Error fetching data: {e}")


encoder_query = "SELECT * FROM ssrlogs.encoderAlarm"
try:
    print("Encoder Alarm...")
    # Membaca jauh lebih cepat dari Pandas
    df_encoder_polars = pl.read_database_uri(encoder_query, db_url)
    
    # Kalau kamu tetap butuh format Pandas untuk script ML yang lama:
    df_encoder = df_encoder_polars.to_pandas() 
    
    print("Encoder Alarm Done! (Polars Engine)")
except Exception as e:
    print(f"Error fetching data: {e}")



netburner_query = "SELECT * FROM ssrlogs.netburner"
try:
    # Membaca jauh lebih cepat dari Pandas
    print("Netburner...")
    df_netburner_polars = pl.read_database_uri(netburner_query, db_url)
    
    # Kalau kamu tetap butuh format Pandas untuk script ML yang lama:
    df_netburner = df_netburner_polars.to_pandas() 
    
    print("NetBurner Done! (Polars Engine)")
except Exception as e:
    print(f"Error fetching data: {e}")


elev_query = "SELECT * FROM ssrlogs.elevationCurrent"
try:
    print("Elevation...")
    # Membaca jauh lebih cepat dari Pandas
    # df_elev_polars = pl.read_database_uri(elev_query, db_url)
    
    # # Kalau kamu tetap butuh format Pandas untuk script ML yang lama:
    # df_elev = df_elev_polars.to_pandas() 
    
    # using Pandas
    df_elev = pd.read_sql(elev_query, engine)


    print("Elevation Current Done! (Polars Engine)")
except Exception as e:
    print(f"Error fetching data: {e}")


print("Data berhasil ditarik ke dalam Pandas DataFrame!")

# Cek sekilas jumlah baris datanya
print(f"Total baris Failure Summary: {len(df_failure)}")
print(f"Total baris Encoder Alarm: {len(df_encoder)}")
print(f"Total baris Azimuth : {len(df_azimuth)}")
print(f"Total baris elevation Current: {len(df_elev)}")
print(f"Total baris Netburner : {len(df_netburner)}")

# 3. SIMPAN KE CSV SEMENTARA (Opsional tapi sangat disarankan)
# Supaya besok kalau mau eksperimen ML, nggak perlu narik dari SQL lagi, cukup baca CSV ini.
# df_failure.to_csv('failure_summary_raw.csv', index=False)
# df_encoder.to_csv('encoder_raw.csv', index=False)
# df_netburner.to_csv('netburner_raw.csv', index=False)
# df_azimuth.to_csv('azimuth_raw.csv', index=False)
# df_elev.to_csv('elevation_raw.csv', index=False)
# print("\nData mentah sudah dibackup ke file CSV lokal.")




import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Menghitung total error untuk tiap radar
# (Berapa kali tiap radar masuk tabel failure, encoder, dan netburner)
fail_count = df_failure.groupby('radar_no').size().reset_index(name='Total_Failure_Umum')
enc_count = df_encoder.groupby('radar_no').size().reset_index(name='Total_Error_Encoder')
net_count = df_netburner.groupby('radar_no').size().reset_index(name='Total_Error_Netburner')

# Menggabungkan ketiganya menjadi satu tabel utuh (Master Profil Radar)
df_radar = pd.merge(fail_count, enc_count, on='radar_no', how='outer')
df_radar = pd.merge(df_radar, net_count, on='radar_no', how='outer')

# Isi nilai kosong (NaN) dengan 0 (karena berarti tidak ada error di komponen tersebut)
df_radar = df_radar.fillna(0)

# Menjadikan radar_no sebagai index agar tidak ikut terhitung oleh rumus K-Means
df_radar.set_index('radar_no', inplace=True)

# 2. STANDARISASI DATA
# Karena rentang angka tiap error bisa beda-beda, kita ratakan skalanya
scaler = StandardScaler()
radar_scaled = scaler.fit_transform(df_radar)

# 3. PROSES K-MEANS CLUSTERING
print("Mesin sedang membagi radar ke dalam kelompok...")
# Kita bagi menjadi 3 kelompok (Cluster)
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
df_radar['Cluster_ID'] = kmeans.fit_predict(radar_scaled)

# 4. MEMBACA WATAK TIAP KELOMPOK
# Kita cari rata-rata error untuk tiap cluster agar tahu ini kelompok apa
cluster_summary = df_radar.groupby('Cluster_ID').mean()
print("\n=== PROFIL RATA-RATA TIAP KELOMPOK ===")
print(cluster_summary)

# 5. EXPORT UNTUK FRONTEND / POWER BI
# Simpan hasil akhir yang sudah ada label kelompoknya ke CSV baru
df_radar.reset_index(inplace=True)
df_radar.to_csv('radar_clusters_result.csv', index=False)
print("Selesai! File 'radar_clusters_result.csv' siap ditarik ke Power BI.")


# In[6]:


# 1. Pilih hanya kolom nama radar dan Cluster ID
df_kategori = df_radar[['radar_no', 'Cluster_ID']].copy()

# 2. Buat kamus secara dinamis berdasarkan rata-rata tiap kelompok
# (K-Means membagikan ID 0,1,2 secara acak, jadi kita tidak bisa hardcode)
cluster_means = df_radar.groupby('Cluster_ID')[['Total_Error_Encoder', 'Total_Error_Netburner']].mean()
cluster_means['Total_Error'] = cluster_means['Total_Error_Encoder'] + cluster_means['Total_Error_Netburner']

nama_kategori = {}

if len(cluster_means) > 0:
    # Cluster dengan total error terendah pasti "Stabil / Sehat"
    stabil_id = cluster_means['Total_Error'].idxmin()
    nama_kategori[stabil_id] = '🟢 Stabil / Sehat'
    
    # Sisa cluster (biasanya 2 lagi)
    remaining_ids = cluster_means.index.drop(stabil_id)
    
    if len(remaining_ids) == 2:
        id1, id2 = remaining_ids
        # Bandingkan mana yang rata-rata error encoder-nya lebih tinggi
        if cluster_means.loc[id1, 'Total_Error_Encoder'] > cluster_means.loc[id2, 'Total_Error_Encoder']:
            nama_kategori[id1] = '🟡 Rawan Encoder'
            nama_kategori[id2] = '🔴 Rawan Netburner'
        else:
            nama_kategori[id2] = '🟡 Rawan Encoder'
            nama_kategori[id1] = '🔴 Rawan Netburner'
    else:
        # Fallback jika ternyata data menghasilkan kurang/lebih dari 3 cluster
        for cid in remaining_ids:
            if cluster_means.loc[cid, 'Total_Error_Encoder'] > cluster_means.loc[cid, 'Total_Error_Netburner']:
                nama_kategori[cid] = '🟡 Rawan Encoder'
            else:
                nama_kategori[cid] = '🔴 Rawan Netburner'

# 3. Terapkan kamus tersebut ke dalam kolom baru
df_kategori['Kategori_Kerusakan'] = df_kategori['Cluster_ID'].map(nama_kategori)

# 4. Tampilkan tabelnya (hanya kolom radar_no dan kategorinya)
# Gunakan .head(20) untuk melihat 20 radar pertama, 
# atau hapus .head(20) jika komputermu kuat menampilkan semuanya ke bawah.
df_kategori[['radar_no', 'Kategori_Kerusakan']]


from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix


# In[8]:


print("1. Menyiapkan Garis Waktu (Timeline)...")
# --- PERBAIKAN FORMAT TANGGAL ---
df_failure['date'] = pd.to_datetime(df_failure['date']).dt.normalize()
df_encoder['date'] = pd.to_datetime(df_encoder['date']).dt.normalize()
df_netburner['date'] = pd.to_datetime(df_netburner['date']).dt.normalize()

# --- MENGHITUNG ERROR HARIAN ---
fail_daily = df_failure.groupby(['radar_no', 'date']).size().reset_index(name='is_failure_today')
enc_daily = df_encoder.groupby(['radar_no', 'date']).size().reset_index(name='count_encoder')
net_daily = df_netburner.groupby(['radar_no', 'date']).size().reset_index(name='count_netburner')

# --- MENGGABUNGKAN MENJADI SATU TIMELINE ---
df_timeline = pd.merge(enc_daily, net_daily, on=['radar_no', 'date'], how='outer')
df_timeline = pd.merge(df_timeline, fail_daily, on=['radar_no', 'date'], how='outer')

df_timeline = df_timeline.fillna(0)
df_timeline = df_timeline.sort_values(by=['radar_no', 'date'])

# --- TAMBAHAN KODE: MEMBUAT KALENDER PENUH (HARI AMAN & RUSAK) ---
print("1.5. Menyisipkan Hari-Hari Aman ke dalam Kalender...")
tanggal_awal = df_timeline['date'].min()
tanggal_akhir = df_timeline['date'].max()
semua_tanggal = pd.date_range(start=tanggal_awal, end=tanggal_akhir)
semua_radar = df_timeline['radar_no'].unique()

# Bikin kerangka kalender penuh untuk setiap radar
kerangka = pd.MultiIndex.from_product([semua_radar, semua_tanggal], names=['radar_no', 'date']).to_frame(index=False)

# Tempelkan log error kita ke kerangka kalender ini
df_timeline = pd.merge(kerangka, df_timeline, on=['radar_no', 'date'], how='left')

# Hari yang kosong (tidak ada log error) berarti radar sehat, kita isi 0
df_timeline = df_timeline.fillna(0)
df_timeline = df_timeline.sort_values(by=['radar_no', 'date'])
# -----------------------------------------------------------------


# In[9]:


print("2. Membuat Target Mesin Waktu (Prediksi H+1)...")
# ... (Lanjut ke kode shift(-1) dan seterusnya seperti biasa) ...
# Geser target failure hari ini ke hari sebelumnya
df_timeline['Target_Besok_Rusak'] = df_timeline.groupby('radar_no')['is_failure_today'].shift(-1)

# Hapus baris terakhir tiap radar
df_timeline = df_timeline.dropna()

# Ubah target jadi 1 (Rusak) atau 0 (Aman)
df_timeline['Target_Besok_Rusak'] = df_timeline['Target_Besok_Rusak'].apply(lambda x: 1 if x > 0 else 0)



# In[10]:


print("3. Memulai Training Random Forest...")
X = df_timeline[['count_encoder', 'count_netburner']]
y = df_timeline['Target_Besok_Rusak']

# Bagi data (80% buat belajar, 20% buat ujian)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

rf_model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
rf_model.fit(X_train, y_train)


# In[11]:


print("4. Ujian Kelulusan Model!")
y_pred = rf_model.predict(X_test)
print("\n=== RAPOR AKURASI (CLASSIFICATION REPORT) ===")
print(classification_report(y_test, y_pred))

# --- MENGEMBALIKAN NAMA RADAR UNTUK POWER BI ---
hasil_prediksi = X_test.copy()
hasil_prediksi['radar_no'] = df_timeline.loc[X_test.index, 'radar_no']
hasil_prediksi['Prediksi_Besok'] = y_pred
hasil_prediksi['Fakta_Sebenarnya'] = y_test

status_map = {0: 'Aman', 1: '⚠️ BAHAYA'}
hasil_prediksi['Prediksi_Besok'] = hasil_prediksi['Prediksi_Besok'].map(status_map)
hasil_prediksi['Fakta_Sebenarnya'] = hasil_prediksi['Fakta_Sebenarnya'].map(status_map)

print("\n=== PREVIEW DATA UNTUK POWER BI ===")
kolom_tampil = ['radar_no', 'count_encoder', 'count_netburner', 'Prediksi_Besok', 'Fakta_Sebenarnya']
print(hasil_prediksi[kolom_tampil].head(15))

# Feature Importance (Tingkat Pengaruh)
feature_imp = pd.Series(rf_model.feature_importances_, index=X.columns).sort_values(ascending=False)
print("\n=== PENGARUH GEJALA (FEATURE IMPORTANCE) ===")
print(feature_imp)


from mlxtend.frequent_patterns import apriori, association_rules

print("1. Menyiapkan Data (Mengubah Angka Menjadi Status Ya/Tidak)...")
# Algoritma ini tidak butuh jumlah error, dia cuma butuh tahu "Ada error atau tidak?"
basket = df_timeline[['count_encoder', 'count_netburner', 'is_failure_today']].copy()

# Ubah semua angka yang lebih dari 0 menjadi True (Ada), sisanya False (Tidak Ada)
basket = basket > 0

# Ubah nama kolom agar hasil bacanya nanti seperti bahasa manusia
basket.columns = ['Ada_Error_Encoder', 'Ada_Error_Netburner', 'Mesin_Mati_Total']

print("2. Mencari Pola Reaksi Berantai (Apriori)...")
# min_support=0.01 artinya kita cuma mencari kejadian yang minimal muncul di 1% dari total data kita
frequent_itemsets = apriori(basket, min_support=0.01, use_colnames=True)

# 3. Merumuskan Aturan Sebab-Akibat
# Kita cari aturan yang tingkat keterikatannya (lift) lebih dari 1 (bukan sekadar kebetulan)
rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)

# Urutkan dari yang paling pasti terjadi (Confidence tertinggi)
rules = rules.sort_values('confidence', ascending=False)

print("\n=== HASIL DETEKSI REAKSI BERANTAI ===")
# Rapikan format tabel agar enak dibaca
hasil_tampil = rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']].head(10)
print(hasil_tampil.to_string(index=False))

import joblib

# Simpan model Random Forest ke dalam file .pkl
joblib.dump(rf_model, 'model_radar_rf.pkl')
print("Model berhasil disimpan! Siap dibawa ke backend.")


# # Install dulu: pip install fastapi uvicorn scikit-learn pandas joblib
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware # 1. Wajib import ini
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Memberi izin ke Next.js untuk menarik data
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 1. Muat model AI yang sudah kita simpan tadi
model = joblib.load('model_radar_rf.pkl')

# 2. Definisikan format data yang akan dikirim dari website
class RadarData(BaseModel):
    count_encoder: int
    count_netburner: int




@app.get("/")
def read_root():
    return {
        "failure": df_failure.fillna("").to_dict(orient="records"),
        "encoder": df_encoder.fillna("").to_dict(orient="records"),
        "netburner": df_netburner.fillna("").to_dict(orient="records"),
        "elev": df_elev.fillna("").to_dict(orient="records"),
        "azimuth": df_azimuth.fillna("").to_dict(orient="records")
    }

@app.get("/api/ml/kmeans")
def read_kmeans():
    # Return K-Means clustering results with coordinate data for plotting
    if 'df_radar' in globals() and 'df_kategori' in globals():
        merged = pd.merge(df_radar, df_kategori[['radar_no', 'Kategori_Kerusakan']], on='radar_no', how='left')
        return merged[['radar_no', 'Total_Error_Encoder', 'Total_Error_Netburner', 'Kategori_Kerusakan']].to_dict(orient="records")
    return []

@app.get("/api/ml/mtbf")
async def get_mtbf_analysis():
    try:
        
        df_clean = df_failure[['first_seen', 'radar_no', 'failure_type']].copy()

        df_clean = df_clean[df_clean['failure_type'].isin(['encoder', 'netburner'])]

        df_clean = df_clean.drop_duplicates()
        
        df_clean = df_clean.sort_values(by=['radar_no', 'failure_type', 'first_seen'])
        
        # Menghitung jarak hari dengan kejadian sebelumnya
        df_clean['days_since_last'] = df_clean.groupby(['radar_no', 'failure_type'])['first_seen'].diff().dt.days
        
        # 5. HITUNG RATA-RATA (MTBF)
        mtbf_stats = df_clean.groupby(['radar_no', 'failure_type'])['days_since_last'].mean().reset_index()
        mtbf_stats = mtbf_stats.rename(columns={'days_since_last': 'mtbf_days'})
      
        mtbf_stats['mtbf_days'] = mtbf_stats['mtbf_days'].fillna(0).round(1)
        mtbf_stats = mtbf_stats[mtbf_stats['mtbf_days'] > 0]
        
        # Urutkan dari radar yang paling kritis (MTBF terkecil / paling sering rusak)
        mtbf_stats = mtbf_stats.sort_values(by='mtbf_days', ascending=False)

        return {
            "status": "success",
            "data": mtbf_stats.to_dict(orient="records")
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}


@app.get("/api/ml/markov")
async def get_markov_chain():
    try:
        # 1. AMBIL DATA DARI SUMMARY
        df_markov = df_failure[['first_seen', 'radar_no', 'failure_type']].copy()
        
        # 2. BERSIHKAN & URUTKAN
        df_markov['first_seen'] = pd.to_datetime(df_markov['first_seen']).dt.normalize()
        
        # Penting: Kita buang duplikat agar jika ada 2 error netburner di hari yang sama, 
        # tidak dihitung sebagai "netburner menyebabkan netburner"
        df_markov = df_markov.drop_duplicates(subset=['first_seen', 'radar_no', 'failure_type'])
        
        # Urutkan secara kronologis per radar
        df_markov = df_markov.sort_values(by=['radar_no', 'first_seen'])
        
        # 3. CARI KEJADIAN SELANJUTNYA (NEXT STATE)
        # Fungsi shift(-1) akan menarik data failure_type dari baris di bawahnya (hari berikutnya)
        df_markov['next_failure'] = df_markov.groupby('radar_no')['failure_type'].shift(-1)
        
        # Hapus data terakhir dari setiap radar karena tidak ada data "besoknya" lagi
        df_markov = df_markov.dropna(subset=['next_failure'])
        
        # 4. HITUNG PROBABILITAS (TRANSITION MATRIX)
        # Hitung berapa kali "Error A" diikuti oleh "Error B"
        transition_counts = df_markov.groupby(['failure_type', 'next_failure']).size().reset_index(name='kejadian_beruntun')
        
        # Hitung total "Error A" terjadi secara keseluruhan
        total_counts = df_markov.groupby('failure_type').size().reset_index(name='total_kejadian')
        
        # Gabungkan dan hitung persentasenya
        markov_stats = pd.merge(transition_counts, total_counts, on='failure_type')
        markov_stats['probability_percent'] = (markov_stats['kejadian_beruntun'] / markov_stats['total_kejadian'] * 100).round(1)
        
        # Urutkan dari probabilitas tertinggi agar langsung menonjol di dashboard
        markov_stats = markov_stats.sort_values(by=['failure_type', 'probability_percent'], ascending=[True, False])

        return {
            "status": "success",
            "data": markov_stats.to_dict(orient="records")
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}


@app.get("/api/ml/apriori")
async def get_apriori_analysis():
    try:
        from mlxtend.frequent_patterns import apriori, association_rules

        # 1. SIAPKAN KERANJANG BELANJA (1 Keranjang = 1 Radar di 1 Hari)
        df_basket = df_failure[['date', 'radar_no', 'failure_type']].copy()
        df_basket['date'] = pd.to_datetime(df_basket['date']).dt.normalize()
        
        # Buang duplikat agar 1 jenis error hanya dihitung 1 kali per hari per radar
        df_basket = df_basket.drop_duplicates()

        # 2. BIKIN MATRIKS ONE-HOT ENCODING (True/False)
        # Baris: kombinasi Radar & Tanggal | Kolom: failure_type
        basket = pd.crosstab(
            index=[df_basket['radar_no'], df_basket['date']], 
            columns=df_basket['failure_type']
        )
        
        # Format ke True/False (Standar terbaru mlxtend)
        basket = basket > 0

        # 3. JALANKAN APRIORI
        # min_support = 0.01 (Minimal pola ini muncul di 1% dari total data harian kita)
        frequent_itemsets = apriori(basket, min_support=0.01, use_colnames=True)
        
        # Jika datanya terlalu sedikit/acak dan tidak ada pola
        if frequent_itemsets.empty:
            return {"status": "success", "data": [], "message": "Belum ada pola asosiasi yang kuat"}

        # 4. CARI ATURAN SEBAB-AKIBAT (RULES)
        # min_threshold = 0.3 (Hanya ambil aturan yang kepastiannya di atas 30%)
        rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.3)
        
        # 5. BERSIHKAN OUTPUT UNTUK DASHBOARD NEXT.JS
        hasil_akhir = []
        for _, row in rules.iterrows():
            # Ubah format frozenset bawaan mlxtend menjadi teks biasa
            antecedents = ", ".join(list(row['antecedents']))
            consequents = ", ".join(list(row['consequents']))
            
            hasil_akhir.append({
                "jika_terjadi": antecedents,
                "maka_terjadi": consequents,
                "confidence_persen": round(row['confidence'] * 100, 1),
                "support_persen": round(row['support'] * 100, 1),
                "lift": round(row['lift'], 2)
            })

        # Urutkan dari confidence tertinggi (Paling pasti terjadi)
        hasil_akhir = sorted(hasil_akhir, key=lambda x: x['confidence_persen'], reverse=True)

        return {
            "status": "success",
            "data": hasil_akhir
        }

    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}






# 4. Tombol Start Server dari dalam Cell
if __name__ == "__main__":
    print("Menyalakan mesin FastAPI... Buka http://127.0.0.1:8000 di browsermu!")
    uvicorn.run(app, host="127.0.0.1", port=8000)


# In[ ]:




