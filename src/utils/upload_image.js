const axios = require("axios");

const uploadImage = async (file) => {
  const cloudname = "dixxfsshj";
  const upload_preset = "magic_post_uet";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", upload_preset);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
    formData
  );
  const { secure_url } = response.data;
  return secure_url;
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

module.exports = uploadImage;