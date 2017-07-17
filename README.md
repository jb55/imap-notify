# imap-notify

  Simplest possible imap notifier

  Connects to an IMAP server and runs a command when new mail is received

## Installation

  Install with npm

    $ npm install -g jb55/imap-notify 

## Usage

    $ imap-notify USER PASS CMD [HOST] [PORT]

  env vars

    IMAP_ALLOW_UNAUTHORIZED=1   # disable cert checking 
