![githana_bg.jpg](http://metric2.com/img/githana_bg.jpg)

GitHANA
=======

A native SAP HANA application for comparing and commiting files directly from the Web UI. Here is a small video of the usage of the app & you can download the app package here.

Features of Git <> HANA

- Compare files between HANA and Github
- Compare inline or side by side
- Commit files from HANA to GitHub
- Commit/activate files from GitHub to HANA
- Repo/branch selection
- Native HANA application
- Easy HANA package installation
- Open source
- handles .xs* (e.g. .xsaccess, .xsapp) files (which your file system probably does not like!)
- Image comparison
- File browsing can be done via the GitHub repo or your HANA package


Install
=======

- Download the package
- Open Lifecycle manager (http://<HANA_SERVER>:PORT/sap/hana/xs/lm/)
- Click on Import/Export menu
- Click Import from File
- Browse to the downloaded file
- Edit the index.html file and specify your github username/password
