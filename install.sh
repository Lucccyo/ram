#!/bin/bash

export NO_STRIP=false
mkdir ~/programs
cd src-tauri/
cargo clean
cargo tauri build
cp target/release/bundle/appimage/ram_0.1.0_amd64.AppImage ~/programs/ram/ram.AppImage
cd ~/.local/share/applications

cat > ram.desktop << EOF
[Desktop Entry]
Type=Application
Name=RAM
Exec=$HOME/programs/ram/ram.AppImage
Terminal=false
EOF
