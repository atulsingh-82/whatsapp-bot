{ pkgs }: {
  deps = [
    pkgs.nodejs
    pkgs.chromium
    pkgs.curl
    pkgs.git
  ];
  shellHook = ''
    export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    export PUPPETEER_SKIP_DOWNLOAD=1
  '';
}
