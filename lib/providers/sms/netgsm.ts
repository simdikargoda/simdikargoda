/**
 * NetGSM SMS Entegrasyonu
 *
 * .env dosyasında aşağıdaki değişkenler tanımlıysa çalışır:
 * NETGSM_USERCODE
 * NETGSM_PASSWORD
 * NETGSM_SENDER (Başlık)
 */

interface SendSmsInput {
  phone: string;
  message: string;
}

export async function sendSms({ phone, message }: SendSmsInput): Promise<boolean> {
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const header = process.env.NETGSM_SENDER;

  // Çevresel değişkenler yoksa (örneğin dev ortamında) console'a yaz ve çık
  if (!usercode || !password || !header) {
    console.log(`[SMS MOCK] ${phone} numarasına mesaj gönderildi: "${message}"`);
    return true;
  }

  // Sadece rakamları al, başında 0 varsa at (NetGSM için genelde 555xxxxxxx istenir)
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.substring(1);
  }
  if (cleanPhone.length < 10) {
    console.error(`[SMS HATA] Geçersiz telefon numarası: ${phone}`);
    return false;
  }

  try {
    const response = await fetch("https://api.netgsm.com.tr/sms/send/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        usercode,
        password,
        msgheader: header,
        mobilenumber: cleanPhone,
        message,
      }),
    });

    const result = await response.text();
    
    // NetGSM "00 " ile başlayan bir yanıt dönerse başarılıdır
    if (result.startsWith("00 ")) {
      console.log(`[SMS BAŞARILI] ${phone}`);
      return true;
    } else {
      console.error(`[SMS HATA] NetGSM Api Yanıtı: ${result}`);
      return false;
    }
  } catch (error) {
    console.error(`[SMS BAĞLANTI HATASI]`, error);
    return false;
  }
}
