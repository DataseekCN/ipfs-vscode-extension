document.head.insertAdjacentHTML(
  'beforeend',
  `
<style>
  * {
    margin: 0;
    box-sizing: border-box;
  }

  body {
    display: flex;
    justify-content: space-between;
    height: 100vh;
  }

  .log {
    width: calc(50% - 0.5em);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .log-title {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--vscode-panel-title-inactive-foreground);
    background-color: var(--vscode-panel-border);
    padding: 0.1em 0.4em 0.1em 0.5em;
    position: relative;
  }

  .log-title::after {
    content: "";
    position: absolute;
    right: -0.5em;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 1.3em 0 0 0.5em;
    border-color: transparent transparent transparent var(--vscode-panel-border);
  }

  .log-container {
    margin-bottom: 1em;
    border: 1px solid var(--vscode-panel-border);
    padding: 0.5em 1em;
    overflow-y: auto;
    flex-grow: 1;
    width: 100%;
  }
</style>
`
)

document.body.insertAdjacentHTML(
  'beforeend',
  `
<div class="log">
  <div class="log-title">Daemon</div>
  <pre class="log-container" id="daemon-log"></pre>
</div>

<div class="log">
  <div class="log-title">IPFS</div>
  <pre class="log-container" id="ipfs-log"></pre>
</div>
`
)

const logContainers = {
  daemon: document.querySelector('#daemon-log'),
  ipfs: document.querySelector('#ipfs-log')
}

window.addEventListener('message', (event) => {
  /** @type {import('../../types/log').Log} */
  const log = event.data

  logContainers[log.type].innerText += log.log
})
