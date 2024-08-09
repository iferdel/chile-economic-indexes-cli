Output bcch.gif

Set Shell "bash"
Set FontSize 16
Set Width 1200
Set Height 600
Set Theme "GitHub Dark"
Set Padding 0
Set Framerate 60

Type@0.2s "./bcch --help" Sleep 500ms  Enter
Sleep 2s

Type@0.15s "./bcch search --frequency ANNUAL --keyword desempleo" Enter
Sleep 20s
Type@0.15s "./bcch get --series F049.DES.TAS.INE1.10.A" Enter
Sleep 15s
