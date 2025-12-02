export const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  const urlParts = url.split("/");
  const fileName = urlParts.pop(); // e.g. "abc123.jpg"
  const publicId = fileName.split(".")[0]; // "abc123"

  const folder = urlParts.slice(urlParts.indexOf("upload") + 1).join("/");

  return `${folder}/${publicId}`; 
};