import * as signalR from "@microsoft/signalr";

const SIGNALR_URL =
    import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/producthub`
        : 'http://localhost:5000/api/producthub';

class SignalRService {
    private connection: signalR.HubConnection | null = null;


    private connectionPromise: Promise<void> | null = null;

    async startConnection(): Promise<void> {
        // 1. Obje yoksa oluştur
        if (!this.connection) {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(SIGNALR_URL)
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build();
        }

        // 2. Zaten bağlıysa işlemi uzatma, başarılı dön
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            return Promise.resolve();
        }

        // 3. Halihazırda bir bağlanma işlemi sürüyorsa, o işlemin bitmesini bekle
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // 4. Bağlantıyı başlat ve Promise'i sakla
        this.connectionPromise = this.connection.start()
            .then(() => {
                console.log("==> [SignalR] Connected successfully.");
                this.connectionPromise = null; // Başarılı olunca kilidi aç
            })
            .catch((err) => {
                console.error("==> [SignalR] Connection error:", err);
                this.connectionPromise = null; // Hata durumunda da kilidi aç

                // 5 saniye sonra yeniden deneme mekanizması
                return new Promise<void>((resolve) => {
                    setTimeout(async () => {
                        await this.startConnection();
                        resolve();
                    }, 5000);
                });
            });

        return this.connectionPromise;
    }

    async joinGroup(groupName: string) {
        if (!this.connection) return;

        // Sadece bağlantı tam olarak kuruluyken gruba katılma isteği at
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke("JoinPageGroup", groupName);
                // Geliştirme aşamasında görmek istersen alttaki satırı açabilirsin:
                // console.log(`==> [SignalR] Joined group: ${groupName}`);
            } catch (err) {
                console.error(`==> [SignalR] joinGroup error (${groupName}):`, err);
            }
        } else {
            console.warn(`==> [SignalR] Cannot join group ${groupName}, state is: ${this.connection.state}`);
        }
    }

    async leaveGroup(groupName: string) {
        if (!this.connection) return;

        if (this.connection.state === signalR.HubConnectionState.Connected) {
            try {
                await this.connection.invoke("LeavePageGroup", groupName);
                // console.log(`==> [SignalR] Left group: ${groupName}`);
            } catch (err) {
                console.error(`==> [SignalR] leaveGroup error (${groupName}):`, err);
            }
        }
    }

    on<T>(eventName: string, callback: (data: T) => void) {
        if (!this.connection) return;
        this.connection.on(eventName, callback);
    }

    off(eventName: string) {
        if (!this.connection) return;
        this.connection.off(eventName);
    }
}

export default new SignalRService();