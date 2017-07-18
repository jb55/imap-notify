#!/usr/bin/env node

const tls = require('tls')
const execFile = require('child_process').execFile

const args   = process.argv;
const user   = args[2] || process.env.IMAP_NOTIFY_USER
const pass   = args[3] || process.env.IMAP_NOTIFY_PASS
const cmd    = args[4] || process.env.IMAP_NOTIFY_CMD
const host   = args[5] || process.env.IMAP_NOTIFY_HOST || "imap.gmail.com"
const port   = args[6] || process.env.IMAP_NOTIFY_PORT || 993
const allow = process.env.IMAP_ALLOW_UNAUTHORIZED == null? false : !!process.env.IMAP_ALLOW_UNAUTHORIZED

function usage() {
  console.error("usage: imap-notify USER PASS CMD [HOST] [PORT]")
  process.exit(1)
}

if (!user || !pass || !cmd) {
  usage();
}

var hadFirst = false;

const socket = tls.connect({host: host, port: port, rejectUnauthorized: !allow}, () => {
  function handleNotifications() {
    socket.on("data", (data) => {
      var str = data.toString();
      console.error(str)

      const res = /\* (\d+) EXISTS/.exec(str);

      if (hadFirst && res && res[1]) {
        execFile(cmd, [res[1]])
      }

      if (!hadFirst) hadFirst = true;
    })
  }

  socket.write(`tag login ${user} ${pass}\r\n`)
  socket.write("A001 SELECT INBOX\r\n")
  socket.write("A002 IDLE\r\n")

  handleNotifications()

  socket.on("close", () => process.exit(2))
})
