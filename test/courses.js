import test from 'ava'

test.before('setup', t => {
  // TODO: Drop all documents in courses DB
  // TODO: Insert test data
  t.end()
})

test('foo', t => {
  t.pass()
  t.end()
})

test('bar', t => {
  t.pass()
  t.end()
})

test.after('cleanup', t => {
  // TODO: Drop all documents in courses DB
  t.end()
})
