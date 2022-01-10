browser.runtime.onMessage.addListener((req, sender, reply) => {
  switch (req.type) {
    case 'getPublicKey':
      reply({})
      break
    case 'signEvent':
      break
  }
})
