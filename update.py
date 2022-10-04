import os
import re
import requests

print("Updating schedules...")

r = requests.get("http://podzial.mech.pk.edu.pl/stacjonarne/html/lista.html")
r.encoding = r.apparent_encoding
html = r.text

f = open("html/lista.html", "w")
f.write(html)
f.close()

urls_match = re.findall(r"<a href=\"(.*?)\" target=\"plan\">", html)

print(f"Got {len(urls_match)} schedules to download...")

for url in urls_match:

	print (f"Downloading {url}")

	r = requests.get("http://podzial.mech.pk.edu.pl/stacjonarne/html/" + url)
	r.encoding = r.apparent_encoding
	html = r.text

	file_path = os.path.join("html", url)
	os.makedirs(os.path.dirname(file_path), exist_ok = True)

	f = open(file_path, "w")
	f.write(html)
	f.close()

print("Done!")
