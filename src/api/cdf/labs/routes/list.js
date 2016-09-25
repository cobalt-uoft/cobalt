import http from 'http'

export default function list(req, res, next) {
  let options  =  {
    host: req.query.host || 'www.teach.cs.toronto.edu',
    port: req.query.port || 80,
    path: req.query.path || '/~cheun550/cdflabs.json'
  }

  http.get(options, response  => {
    if (response.statusCode != 200) {
      let err = new Error('CDF data is currently inaccessible.')
      err.status = 500
      return next(err)
    }

    let data = ''
    response.on('data', chunk => {
      data += chunk
    })

    response.on('end', () => {
      res.charset = 'utf-8'
      res.set('Content-Type', 'application/json')
      res.send(data)
    })
  })
}
