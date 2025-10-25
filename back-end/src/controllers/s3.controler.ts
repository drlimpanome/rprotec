import * as AWS from "aws-sdk";
import { PutObjectRequest, GetObjectRequest } from "aws-sdk/clients/s3";
import mime from "mime-types"; // Instale com `npm install mime-types`

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export class S3Controller {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME!; // Bucket name from env
    if (!this.bucketName) {
      throw new Error("AWS_S3_BUCKET_NAME environment variable is not set.");
    }
  }

  // Save a file to S3
  async saveFile(
    folder: string,
    fileName: string,
    fileContent: Buffer
  ): Promise<string> {
    const encodedFileName = encodeURIComponent(fileName);
    const key = `${folder}/${encodedFileName}`; // Caminho completo no S3

    const params: PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key, // Usa a key correta
      Body: fileContent,
    };

    try {
      await s3.upload(params).promise();
      return encodedFileName; // Retorna a URL completa do arquivo no S3
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async retrieveFile(
    folder:
      | "servicos/comprovantes"
      | "listas/comprovantes"
      | `servicos/form-uploads/${any}`,
    fileName: string
  ): Promise<{ buffer: Buffer; contentType: string; base64?: string }> {
    const key = `${folder}/${fileName}`;

    console.log("📂 Recuperando arquivo:", key);

    const params: GetObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const data = await s3.getObject(params).promise();

      let contentType = data.ContentType || "application/octet-stream";

      // Se o tipo for "application/octet-stream", tentamos inferir o MIME pelo nome do arquivo
      if (contentType === "application/octet-stream") {
        const inferredType = mime.lookup(fileName);
        if (inferredType) {
          contentType = inferredType; // Se conseguiu inferir, usa o tipo correto
        }
      }

      // Se for uma imagem, converte para Base64
      if (contentType.startsWith("image/")) {
        return {
          buffer: data.Body as Buffer,
          contentType,
          base64: `data:${contentType};base64,${data.Body?.toString("base64")}`,
        };
      }

      return {
        buffer: data.Body as Buffer,
        contentType,
      };
    } catch (error: any) {
      console.error("❌ Erro ao recuperar arquivo:", error.message);
      throw error;
    }
  }
}
