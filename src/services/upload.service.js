export const uploadService = {
  uploadImg
}

async function uploadImg(ev) {
  try {
    const cloudName = "dtgejpwv9"
    const apiKey = "585279116812262"
    const uploadPreset = "itziklevi"
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

    const formData = new FormData();
    formData.append('upload_preset', uploadPreset);
    formData.append('file', ev.target.files[0]);
    formData.append('api_key', apiKey);

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error; // Rethrow the error to propagate it to the caller
  }
}
