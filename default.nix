{ stdenv, lib, makeWrapper, nodejs }:

stdenv.mkDerivation rec {
  pname = "imap-notify";
  version = "0.1.1";

  src = ./.;

  makeFlags = "PREFIX=$(out)";

  phases = ["installPhase"];

  buildInputs = [ makeWrapper ];

  installPhase = ''
    mkdir -p $out/bin
    cp $src/index.js $out/bin/imap-notify
    wrapProgram $out/bin/imap-notify \
      --prefix PATH : "${nodejs}/bin"
  '';

  meta = with lib; {
    description = "imap-notify";
    homepage = "https://github.com/jb55/imap-notify";
    maintainers = with maintainers; [ jb55 ];
    license = licenses.mit;
  };
}
