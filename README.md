GitHANA
=======

![img](http://scn.sap.com/servlet/JiveServlet/downloadImage/38-112364-525261/526-400/Git-HANA-Screenshot.jpg)

A native SAP HANA application for comparing and commiting files directly from the Web UI. Read more here: [link to SAP community network blog](http://scn.sap.com/community/developer-center/hana/blog/2014/08/22/git-hana--a-free-open-source-github-client-for-sap-hana)

- Compare files between HANA and Github
- Compare inline or side by side
- Commit files to Github directly from the Web UI
- Native HANA application
- Easy HANA package installation
- Open source
- handles .xs* (e.g. .xsaccess, .xsapp) files

Revisions
=======

- Release 1.0
Supports SAP HANA <= SPS08

- Release 2.0
Supports SAP HANA >= SPS09

- Release 2.1
Supports defining your Github API endpoint (Useful for enterprise GitHub customers)

Install
=======

Option 1

- Download the package from here [URL](http://www.metric2.com/metric2-downloads/)
- Open Lifecycle manager (http://<HANA_SERVER>:PORT/sap/hana/xs/lm/)
- Click on Import/Export menu
- Click Import from File
- Browse to the downloaded file
- Edit the index.html file and specify your github api, hana verison, username/password

Option 2
- Download/fork this repo
- upload from eclipse or the webIDE