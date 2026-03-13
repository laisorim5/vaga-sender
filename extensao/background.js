chrome.runtime.onInstalled.addListener(() => {
  const destinos = [
    { id: "estagio", title: "📢 Enviar para Estágio" },
    { id: "dados",   title: "📊 Enviar para Dados" },
    { id: "tech",    title: "💻 Enviar para Tech" },
  ];

  destinos.forEach(destino => {
    chrome.contextMenus.create({
      id: destino.id,
      title: destino.title,
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const destino = info.menuItemId;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: capturarDadosDaPagina,
  }, (results) => {
    const dados = results[0].result;
    dados.destino = destino;

    // Salva no storage e abre o popup via notificação na aba
    chrome.storage.local.set({ vagaPendente: dados }, () => {
      // Injeta um aviso visual na página pra você clicar no ícone
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const aviso = document.createElement("div");
          aviso.id = "vaga-sender-aviso";
          aviso.innerText = "✅ Vaga capturada! Clique no ícone da extensão para enviar.";
          aviso.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #25D366;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: sans-serif;
            font-size: 14px;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          `;
          document.body.appendChild(aviso);
          setTimeout(() => aviso.remove(), 4000);
        }
      });
    });
  });
});

function capturarDadosDaPagina() {
  const textoSelecionado = window.getSelection().toString().trim();
  const linkAtual = window.location.href;

  const selection = window.getSelection();
  let imagemUrl = null;

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer.parentElement;
    const card = container.closest("article, [data-urn], .feed-shared-update-v2") || container;
    const img = card.querySelector("img");
    if (img) imagemUrl = img.src;
  }

  return {
    texto: textoSelecionado,
    link: linkAtual,
    imagemUrl: imagemUrl
  };
}