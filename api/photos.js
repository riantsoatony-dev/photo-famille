// api/photos.js
export default async function handler(req, res) {
  // On accepte uniquement les requêtes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Variables d’environnement manquantes' });
  }

  // On va chercher les ressources dans le dossier "famille"
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`;
  const params = new URLSearchParams({
    prefix:       'famille/',        // dossier
    max_results:  100,
    context:      true,              // pour récupérer title/year
  });

  try {
    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudinary API error: ${response.status}`);
    }

    const data = await response.json();
    const resources = data.resources || [];

    const photos = resources.map(r => ({
      id:    r.public_id,
      url:   `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${r.public_id}`,
      thumb: `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_400/${r.public_id}`,
      title: r.context?.custom?.caption || r.context?.custom?.title || '',
      year:  r.context?.custom?.year || '',
    }));

    res.status(200).json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des photos' });
  }
}