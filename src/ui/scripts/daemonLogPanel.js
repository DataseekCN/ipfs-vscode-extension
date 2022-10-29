const logContainer = document.createElement('pre')
document.body.append(logContainer)

window.addEventListener('message', (event) => {
  const log = event.data
  logContainer.innerText += log
})
