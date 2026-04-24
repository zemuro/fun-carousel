Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
' Получаем полный путь к этому VBS файлу и извлекаем из него папку
strScriptPath = WScript.ScriptFullName
strPath = objFSO.GetParentFolderName(strScriptPath)
' Формируем команду для запуска bat-файла в этой же папке
strCommand = "cmd /c " & Chr(34) & Chr(34) & strPath & "\start-server.bat" & Chr(34) & Chr(34)
objShell.Run strCommand, 0, False
Set objShell = Nothing
Set objFSO = Nothing
