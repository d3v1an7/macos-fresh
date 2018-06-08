#!/usr/bin/osascript
tell application "System Preferences"
	reveal anchor "displaysDisplayTab" of pane "com.apple.preference.displays"
end tell
tell application "System Events" to tell process "System Preferences" to tell window "Built-in Retina Display"
	# Set resolution to scaled, with more space
	click radio button "Scaled" of radio group 1 of tab group 1
	click radio button 5 of radio group 1 of group 2 of tab group 1
	# Set brightness to 85%
	set value of value indicator 1 of slider 1 of group 1 of tab group 1 to 0.85
	# Disable automatic brightness
	tell checkbox "Automatically adjust brightness" of group 1 of tab group 1 to if value is 1 then click
end tell
quit application "System Preferences"
