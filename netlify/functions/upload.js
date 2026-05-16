// Image upload is disabled on Netlify (read-only filesystem).
// To add a new pizza image: drop the .png into shared/images/ in the repo
// and push — Netlify will redeploy with the new asset.
// For a real upload path, wire up Netlify Blobs, Cloudinary, S3, etc.
exports.handler = async () => ({
  statusCode: 501,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    error: 'Image upload is not available on this deployment. Add the image file to /shared/images in the repo and redeploy.'
  })
});
