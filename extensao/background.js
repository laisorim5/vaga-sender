// Quando a extensão é instalada, cria os menus do botão direito
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
      contexts: ["selection"] // só aparece quando tem texto selecionado
    });
  });
});

// Quando o usuário clica em uma opção do menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const destino = info.menuItemId;

  // Executa um script dentro da página pra capturar texto e imagem
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: capturarDadosDaPagina,
  }, (results) => {
    const dados = results[0].result;
    dados.destino = destino;

    // Salva no storage pra o popup conseguir ler
    chrome.storage.local.set({ vagaPendente: dados });

    // Abre o popup
    chrome.action.openPopup();
  });
});

// Essa função roda DENTRO da página (não tem acesso ao Chrome)
function capturarDadosDaPagina() {
  const textoSelecionado = window.getSelection().toString().trim();
  const linkAtual = window.location.href;

  // Tenta achar imagem próxima do texto selecionado
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