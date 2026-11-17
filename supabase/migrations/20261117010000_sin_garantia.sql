-- Se quita la garantía del sitio: borra su pregunta del chatbot.
delete from public.preguntas where clave = 'garantia' or pregunta = '¿Los trabajos tienen garantía?';
