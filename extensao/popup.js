const params = new URLSearchParams(window.location.search);
const texto = params.get("texto") || "";
const link = params.get("link") || "";
const imagemUrl = params.get("imagemUrl") || "";

if (texto || link) {
  document.getElementById("texto").value = texto;
  document.getElementById("link").value = link;
  if (imagemUrl) {
    const preview = document.getElementById("preview");
    preview.src = imagemUrl;
    preview.style.display = "block";
  }
} else {
  document.getElementById("status").innerText = "✏️ Preencha os campos manualmente";
}

document.addEventListener("paste", (e) => {
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const preview = document.getElementById("preview");
        preview.src = ev.target.result;
        preview.style.display = "block";
        document.getElementById("imagem-area").innerText = "✅ Imagem colada!";
      };
      reader.readAsDataURL(blob);
    }
  }
});

function enviar(destino) {
  const texto = document.getElementById("texto").value;
  const link = document.getElementById("link").value;
  const imagemUrl = document.getElementById("preview").src;

  document.getElementById("status").innerText = "Enviando...";

  fetch("http://localhost:5000/enviar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto, link, imagemUrl, destino })
  })
  .then(r => r.json())
  .then(() => {
    document.getElementById("status").innerText = "✅ Enviado!";
    chrome.storage.local.remove("vagaPendente");
  })
  .catch(() => {
    document.getElementById("status").innerText = "❌ Erro. Backend rodando?";
  });
}