@echo off
cls
del game.zip

sfk list -dir scripts -dir . !\tests\ !\node_modules\ !\releases\ !\build\ !\.vscode\ !\.git\ !\.vs\ -file !.exe !.bat !.md !.sln | zip -@ game.zip
D:\Android\sdk\platform-tools\adb kill-server
D:\Android\sdk\platform-tools\adb start-server
D:\Android\sdk\platform-tools\adb push game.zip /storage/sdcard0/Download
