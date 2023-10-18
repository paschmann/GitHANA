GitHANA
=======

![img](https://github.com/paschmann/GitHANA/blob/master/img/git_hana_screenshot_525261.jpg)

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

- Release 2.2
Has a small local DB schema and table which holds committed version data. This allows us to show which files are different between your repo and hana package.

- Release 2.3
Changes to the .hdb files to handle case sensativity

Install
=======

Option 1

- Download the package from here [URL](http://www.metric2.com/metric2-downloads/)
- Open Lifecycle manager (http://<HANA_SERVER>:PORT/sap/hana/xs/lm/)
- Click on Import/Export menu
- Click Import from File
- Browse to the downloaded file
- Edit the lib/hanagit.js file and specify your github api, hana verison, username/password
- Make sure your user has the security role: lilabs.github.core::admin

Option 2
- Download/fork this repo
- upload from eclipse or the webIDE
