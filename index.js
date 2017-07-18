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
const timeout  = process.env.IMAP_IDLE_TIMEOUT || 300000; // 5 mins

function usage() {
  console.error("usage: imap-notify USER PASS CMD [HOST] [PORT]")
  process.exit(1)
}

if (!user || !pass || !cmd) {
  usage();
}

var ready = false;

const socket = tls.connect({host: host, port: port, rejectUnauthorized: !allow}, () => {
  function handleNotifications() {
    socket.on("data", (data) => {
      var str = data.toString();
      console.error(str)

      const res = /\* (\d+) EXISTS/.exec(str);

      if (ready && res && res[1]) {
        execFile(cmd, [res[1]])
      }

      if (/\+ idling/.test(str))
        ready = true;
    })
  }

  socket.write(`tag login ${user} ${pass}\r\ntag SELECT INBOX\r\ntag IDLE\r\n`)

  handleNotifications()

  setInterval(() => {
    socket.write("DONE\r\ntag IDLE\r\n");
  }, timeout);

  socket.on("close", () => process.exit(2))
})
