const writeStdoutToHtml = (daemon) => {
  console.log('-----------')
  document.write(`<div>${g}</div>`)
  document.write('<div>This is a par.</div>')
  // daemon.stdout?.on('data', (chunk) => document.write(`<div>${chunk}</div>`))
}
