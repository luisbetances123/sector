from PIL import Image

img = Image.open("public/sector-logo.png")
ancho, alto = img.size
print(f"Imagen original: {ancho}x{alto}")

recorte = img.crop((0, 0, alto, alto))
recorte = recorte.resize((512, 512), Image.LANCZOS)
recorte.save("app/icon.png")

print("OK: favicon cuadrado guardado en app/icon.png")
