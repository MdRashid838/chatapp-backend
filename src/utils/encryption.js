// const crypto = require("crypto");

// const algorithm = "aes-256-cbc";
// const secretKey = process.env.ENCRYPTION_KEY; // 32 chars
// const iv = crypto.randomBytes(16);

// // encrypt
// exports.encryptMessage = (text) => {
//   const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);

//   let encrypted = cipher.update(text);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);

//   return {
//     iv: iv.toString("hex"),
//     content: encrypted.toString("hex")
//   };
// };

// // decrypt
// exports.decryptMessage = (hash) => {
//   const decipher = crypto.createDecipheriv(
//     algorithm,
//     Buffer.from(secretKey),
//     Buffer.from(hash.iv, "hex")
//   );

//   let decrypted = decipher.update(Buffer.from(hash.content, "hex"));
//   decrypted = Buffer.concat([decrypted, decipher.final()]);

//   return decrypted.toString();
// };


const crypto = require("crypto");

const algorithm = "aes-256-cbc";
// Ensure secretKey is treated correctly (hex string converted to a 32-byte Buffer)
const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); 

// Encrypt
exports.encryptMessage = (text) => {
  // 1. Generate a fresh, random IV for EVERY message
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex")
  };
};

// Decrypt
exports.decryptMessage = (hash) => {
  // 2. Extract the unique IV stored with this specific message
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );

  let decrypted = decipher.update(Buffer.from(hash.content, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
};