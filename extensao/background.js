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

    // Passa os dados direto na URL do popup
    const params = new URLSearchParams({
      texto: dados.texto || "",
      link: dados.link || "",
      imagemUrl: dados.imagemUrl || "",
      destino: destino
    });

    chrome.windows.create({
      url: chrome.runtime.getURL(`popup.html?${params.toString()}`),
      type: "popup",
      width: 370,
      height: 500
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