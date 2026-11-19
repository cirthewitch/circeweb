-- El panel ya optimiza las imágenes antes de subirlas (máx. 1600 px, WebP).
-- Esto pone un tope también del lado de Supabase: solo imágenes y máximo 2 MB por archivo.
update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'image/gif']
where id = 'media';
