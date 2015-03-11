var HanaRepoService = "/sap/hana/xs/dt/base/file/";
var HanaCSRFService = "/sap/hana/ide/common/remote/server/csrf.xsjs";
var HanaPackage = "lilabs/mobileapi/"; /*    lilabs/metric2/    */
var gitUsername = "paschmann";
var gitPassword = "Pa9909711";
var gitEmail = "paul@paups.com";
/* var gitAPI = "https://github.wdf.sap.corp/api/v3"; /* SAP Internal Github API  */
var gitAPI = "https://api.github.com"; /* Public Git API */
var gitRawContent = "https://raw.githubusercontent.com";

var csrf;
var repo;
var hanaData;
var gitData;
var selectedViewType;
var saveType;
var hanaFileVersions;

var github;

$(function() {
    init();
});

function init() {
    github = null;
    github = new Github({
        username: gitUsername,
        password: gitPassword,
        auth: "basic",
        email: gitEmail,
        api: gitAPI
    });


    loadRepoList();
    $('#hanapackage').val(HanaPackage);
    loadHanaPackageContents(HanaPackage, $('#hanasystem'));
    getCRSFToken();

    $("#sysTabs a").click(function(e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $('#btnSideBar').click(function(e) {
        if ($('#logoarea').css("display") == "block") {
            $('#logoarea').css("display", "none");
            $('#main').css("margin-left", "0");
            $('#header .tools-bar').css("margin-left", "0");
        } else {
            $('#logoarea').css("display", "block");
            $('#main').css("margin-left", "270px");
            $('#header .tools-bar').css("margin-left", "250px");
        }
    });

    $(document).on("click", ".hanafolder", function(event) {
        event.stopPropagation();
        if ($(this).children().find('li').length > 0) {
            $(this).children().find('li').remove();
        } else {
            loadHanaPackageContents($(this).data('ref'), $(this));
        }
    });

    $(document).on("click", ".hanapage", function(event) {
        event.stopPropagation();
        clearResults();
        var filename = $(this).data('ref');
        var version = $(this).data('version');
        $("#version").html(version);
        getFile(filename);
        //compareFiles(selectedViewType);
    });

    $(document).on("click", ".folder", function(event) {
        $(this).next('ul').find('> li').slideToggle('slow');
    });

    $(document).on("click", ".page", function(event) {
        event.stopPropagation();
        clearResults();
        var filename = $(this).data('ref');
        getFile(filename);
    });

}

function loadRepoList() {
    var user = github.getUser();
    user.repos(function(err, repos) {
        var s = $('<select id="GitRepo" />');
        $('<option />', {
            value: "",
            text: ""
        }).appendTo(s);
        $.each(repos, function(key, value) {
            $('<option />', {
                value: value.name,
                text: value.name
            }).appendTo(s);
        });

        s.appendTo('#cboRepo');

        s.change(function() {
            $('#filesystem').html('');
            loadRepoBranchList($(this).val());
        });

    });
}

function loadRepoBranchList(repoName) {
    repo = github.getRepo(gitUsername, repoName);
    repo.listBranches(function(err, branches) {
        $('#cboBranch').html('');
        var s = $('<select id="RepoBranch" />');
        $('<option />', {
            value: "",
            text: ""
        }).appendTo(s);
        $.each(branches, function(key, value) {
            $('<option />', {
                value: value,
                text: value
            }).appendTo(s);
        });

        s.appendTo('#cboBranch');

        s.change(function() {
            $('#filesystem').html('');
            loadRepoContents($('#GitRepo').val(), $(this).val());
            getFileVersions();
        });
    });
}

function loadRepoContents(repoName, repoBranch) {
    //Decrecated? No longer show a github version of the filesystem
    repo = github.getRepo(gitUsername, repoName);
    repo.getTree(repoBranch + '?recursive=true', function(err, tree) {
        var depth = 0;
        var foldername = "";
        var html = "";
        tree.forEach(function(obj) {
            var parser = document.createElement('a');
            parser.href = obj.path;

            if (obj.path.split("/").length > depth) {
                html += "<ul>";
            } else if (obj.path.split("/").length < depth) {
                var diff = depth - obj.path.split("/").length;
                for (var i = 1; i <= diff; i++) {
                    html += "</ul>";
                }
            }
            depth = obj.path.split("/").length;
            foldername = parser.pathname;

            var vis = (depth > 1 ? "none" : "");

            if (obj.type == "tree") {
                html += "<li class='folder' data-id='0' style='display: " + vis + "'><i class='fa fa-folder'></i><a href='#'>  " + obj.path.split("/").slice(obj.path.split("/").length - 1) + "</a></li>";
            } else {
                html += "<li class='page' data-id='1' style='display: " + vis + "' data-ref='" + obj.path + "'><i class='fa fa-file-code-o'></i><a href='#'>  " + obj.path.split("/").slice(obj.path.split("/").length - 1) + "</a></li>";
            }
        });

        $('#filesystem').html(html);
    });
}

function loadHanaPackageContents(path, obj) {
    if (path.substring(path.length - 1, path.length) == "/") {
        path = path.substring(0, path.length - 1);
    }
    $.ajax({
        type: "GET",
        url: HanaRepoService + path + "?depth=1",
        success: function(files) {
            var prevObjectDepth = 0;
            var html2 = "";

            $.each(files["Children"], function() {
                var relativepath = this.Location.replace(HanaRepoService + HanaPackage, '');
                var objectDepth = relativepath.split("/").length;

                if (objectDepth > prevObjectDepth) {
                    html2 += "<ul>";
                } else if (objectDepth < prevObjectDepth) {
                    var diff = prevObjectDepth - objectDepth;
                    for (var i = 1; i <= diff; i++) {
                        html2 += "</ul>";
                    }
                }

                if (this.Directory === true) {
                    html2 += "<li class='hanafolder' data-id='0' style='display: block' data-ref='" + this.ContentLocation + "'><i class='fa fa-folder'></i><a href='#'>  " + this.Name + "</a></li>";
                } else {
                    var sapbackpack = JSON.parse(this.SapBackPack);
                    html2 += "<li class='hanapage' data-id='1' data-version='" + sapbackpack.Version + "' data-run='" + this.RunLocation + "' style='display: block' data-ref='" + relativepath + "'><i class='fa fa-file-code-o'></i><a href='#'>  " + this.Name + "</a></li>";
                }

                prevObjectDepth = objectDepth;
            });

            // versions from hana db table to compare versions
            getFileVersions();
            html2 += "</ul>";

            $("#loadspinner").css('display', 'none');
            $(obj).append(html2);
        },
        error: function(err) {
            $("#loadspinner").css('display', 'none');
        }
    });
}


function getFile(filename) {
    $('#filename').html(filename);
    HanaPackage = $('#hanapackage').val();
    var hanafilename = filename;

    if (typeof repo === 'undefined') {
        alert("Please select a Github repository");
    } else {
        var isimg = false;
        $("#loadspinner").css('display', 'block');

        if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(filename)) {
            var img = $('<img id="gitimg">');
            img.attr('src', gitRawContent + '/' + gitUsername + '/' + $('#GitRepo').val() + '/' + $('#RepoBranch').val() + '/' + filename);
            var img2 = $('<img id="hanaimg">');
            //img2.attr('src', '/' + HanaPackage + hanafilename);
            $('#results').html('<table id="imgTable"><tr><td class="center">Hana</td><td class="center">Github</td></tr><tr><td id="img1" class="center"></td><td id="img2" class="center"></td></tr></table>');
            $('#img1').html(img2);
            $('#img2').html(img);
            isimg = true;
            saveType = 'Image';
            var image = new Image();
            var canvas = document.createElement("canvas"),
                canvasContext = canvas.getContext("2d");
            image.src = '/' + HanaPackage + hanafilename;

            image.onload = function() {
                canvas.width = image.width;
                canvas.height = image.height;

                // draw image into canvas element
                canvasContext.drawImage(image, 0, 0, image.width, image.height);

                // get canvas contents as a data URL (returns png format by default)
                var dataURL = canvas.toDataURL();
                $('#hanaimg').attr('src', dataURL);
                hanaData = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
            };

            loadRepoData(filename, isimg);
        } else {
            var hanafilename = HanaRepoService + HanaPackage + hanafilename;
            $.ajax({
                type: "GET",
                url: hanafilename,
                success: function(data1, status, xhr) {
                    var ct = xhr.getResponseHeader("content-type") || "";
                    if (ct.indexOf('json') > -1) {
                        hanaData = JSON.stringify(data1);
                    } else {
                        hanaData = data1
                    }
                    $('#btn1').show();
                    $('#btn2').show();
                    $('#btn3').show();
                    loadRepoData(filename, isimg);
                },
                error: function(err) {
                    hanaData = 'Error getting file from HANA Repository, please check file exists.';
                    $('#btn1').show();
                    $('#btn2').hide();
                    $('#btn3').hide();
                    loadRepoData(filename, isimg);
                }
            });
        }
    }
}

function loadRepoData(filename, isimg) {
    repo.read($('#RepoBranch').val(), filename, function(err, data2) {
        if (err != null) {
            gitData = "Error getting file from Github Repository, please check file exists.";
        } else {
            gitData = data2;
        }
        $('#btn1').show();
        $('#btn2').show();
        $('#btn3').show();
        if (!isimg) {
            compareFiles(0);
        }
        $("#loadspinner").css('display', 'none');
    });
}

function updateVersion(runloc, version, service) {
    $.ajax({
        url: "/lilabs/github/lib/api.xsjs",
        type: 'GET',
        data: {
            service: service,
            runloc: runloc,
            version: version,
            gitrepo: $('#GitRepo').val(),
            branch: $('#RepoBranch').val()
        },
        success: function(data) {
            console.log("Saved");
            getFileVersions();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
}

function checkFileVersions() {
    $(".hanapage").each(function() {
        var file = this;
        var found = false;
        $.each(hanaFileVersions, function(dbfile) {
            if (file.dataset.run === this.run_location) {
                found = true;
                if (parseInt(file.dataset.version) > this.commited_version) {
                    $("#hanasystem").find("[data-run='" + this.run_location + "']").css("background-color", "#333");
                }
            }
        });
        if (!found) {
            $("#hanasystem").find("[data-run='" + file.dataset.run + "']").css("background-color", "#111");
        }
    });
}

function getFileVersions() {
    $.ajax({
        url: "/lilabs/github/lib/api.xsjs",
        type: 'GET',
        data: {
            service: "getfiles",
            package: HanaPackage,
            gitrepo: $('#GitRepo').val(),
            branch: $('#RepoBranch').val()
        },
        success: function(filelist) {
            hanaFileVersions = filelist;
            checkFileVersions();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
}


function saveToGitHub() {
    var r = confirm("Are you sure you want to commit this file to your Github repository?");
    if (r == true) {
        var comment = prompt("Please enter a comment", "Update " + $('#filename').html());
        if (comment != null) {
            $("#loadspinner").css('display', 'block');
            repo.write($('#RepoBranch').val(), $('#filename').html(), hanaData, comment, function(err) {
                $("#loadspinner").css('display', 'none');
                //Save to local githana::files table
                updateVersion("/" + HanaPackage + $('#filename').html(), $('#version').html(), "commitfile");
                getFile($('#filename').html());
                loadRepoContents($('#GitRepo').val(), $('#RepoBranch').val());
                $("#hanasystem").find("[data-run='" + "/" + HanaPackage + $('#filename').html() + "']").css("background-color", "none");
            });
        }
    }
}

function deleteFromGitHub() {
    var r = confirm("Are you sure you want to delete this file from your Github repository?");
    if (r == true) {
        var comment = prompt("Please enter a comment", "Delete " + $('#filename').html());
        if (comment != null) {
            $("#loadspinner").css('display', 'block');
            repo.remove($('#RepoBranch').val(), $('#filename').html(), function(err) {
                $("#loadspinner").css('display', 'none');
            });
        }
    }
}

function compareFiles(viewType) {
    "use strict";
    var byId = function(id) {
        return document.getElementById(id);
    },
        base = difflib.stringAsLines(hanaData),
        newtxt = difflib.stringAsLines(gitData),
        sm = new difflib.SequenceMatcher(base, newtxt),
        opcodes = sm.get_opcodes(),
        diffoutputdiv = byId("results"),
        contextSize = null;

    selectedViewType = viewType;
    diffoutputdiv.innerHTML = "";
    contextSize = contextSize || null;

    diffoutputdiv.appendChild(diffview.buildView({
        baseTextLines: base,
        newTextLines: newtxt,
        opcodes: opcodes,
        baseTextName: "HANA File",
        newTextName: "Github File",
        contextSize: contextSize,
        viewType: viewType
    }));
}

function showSettings() {
    $('#modal-header').html("Settings");
    $('#dialogHTML1').css('height', 'auto');
    $('#modaldlg').css('height', 'auto');
    $('#modaldlg').css('width', '720px');
    $('#myModal').appendTo("body").modal('show');

    var strHTML = '<form role="form">';
    strHTML += '<div class="form-group">';
    strHTML += '<label for="txtGithubusername">Github Username</label>';
    strHTML += '<input type="username" class="form-control" id="txtGithubusername" placeholder="Username">';
    strHTML += '</div>';
    strHTML += '<div class="form-group">';
    strHTML += '<label for="txtGithubpassword">Password</label>';
    strHTML += '<input type="password" class="form-control" id="txtGithubpassword" placeholder="Password">';
    strHTML += '</div>';
    strHTML += '<div class="form-group">';
    strHTML += '<label for="txtRepoService">HANA Repo Service URL</label>';
    strHTML += '<input type="hanareposvc" class="form-control" id="txtRepoService" placeholder="URL to the RepoService.xsjs file">';
    strHTML += '</div>';
    strHTML += '<div class="form-group">';
    strHTML += '<label for="txtPackage">HANA Package Name</label>';
    strHTML += '<input type="hanapackage" class="form-control" id="txtPackage" placeholder="HANA Package Path">';
    strHTML += '</div>';
    strHTML += '</form>';

    $('#dialogHTML1').html(strHTML);

    $('#txtGithubusername').val(gitUsername);
    $('#txtGithubpassword').val(gitPassword);
    $('#txtRepoService').val(HanaRepoService);
    $('#txtPackage').val(HanaPackage);
}

function saveDialog() {
    if ($('#modal-header').html().indexOf('Settings') > -1) {
        gitUsername = $('#txtGithubusername').val();
        gitPassword = $('#txtGithubpassword').val();
        HanaRepoService = $('#txtRepoService').val();
        HanaPackage = $('#txtPackage').val();
        $('#hanapackage').val(HanaPackage);
        $('#myModal').modal('hide');
        clearFileSystem();
        init();
    } else if ($('#modal-header').html().indexOf('Pull') > -1) {
        var r = confirm("Are you sure you want to do a pull to your HANA package? This will overwrite any existing files!");
        if (r == true) {
            pullFromGithub();
        } else {
            $('#myModal').modal('hide');
        }
    } else if ($('#modal-header').html().indexOf('Push') > -1) {
        var r = confirm("Are you sure you want to do a push to your Github repo? This will overwrite any existing files!");
        if (r == true) {
            pushToGitHub();
        } else {
            $('#myModal').modal('hide');
        }
    }
}

function clearResults() {
    $('#results').html('');
    hanaData = "";
    gitData = "";
}

function clearFileSystem() {
    $('#filesystem').html('');
    $('#filename').html('');
    $('#version').html('');
    $('#cboBranch').html('');
    $('#cboRepo').html('');
    $('#hanasystem').html('');
}

function saveConfirm() {
    var r = confirm("Are you sure you want to commit this file to your HANA Package? This will overwrite your local file if it exists!");
    if (r == true) {
        saveToHana(gitData, $('#filename').html(), 'file');
    }
}

/* v2 Feature */
function saveToHana(data, path, type) {
    $("#loadspinner").css('display', 'block');

    path = path;
    var activate = 'true';

    if (type == 'tree') {
        activate = 'false';
    }

    var objSapBackPack = {};
    objSapBackPack.CreatePkg = true;

    $.ajax({
        type: "PUT",
        contentType: "text/plain; charset=UTF-8",
        headers: {
            'X-CSRF-Token': csrf,
            'activate': activate,
            'SapBackPack': JSON.stringify(objSapBackPack)
        },
        url: HanaRepoService + HanaPackage + path,
        data: data,
        success: function(msg) {
            $("#loadspinner").css('display', 'none');
            if (saveType !== 'Pull') {
                getFile(path);
            }
        },
        error: function(err) {
            $("#loadspinner").css('display', 'none');
        }
    });
}

function getCRSFToken() {
    $.ajax({
        type: "HEAD",
        headers: {
            'X-CSRF-Token': 'Fetch'
        },
        url: HanaCSRFService,
        success: function(res, status, xhr) {
            csrf = xhr.getResponseHeader("X-CSRF-Token");
        },
        error: function(err) {
            $("#loadspinner").css('display', 'none');
        }
    });
}

function openRepo() {
    var win = window.open('https://github.com/' + gitUsername, '_blank');
    win.focus();
}


function pullGit() {
    $('#modal-header').html("Pull Git Repository to HANA");
    $('#dialogHTML1').html("Click save to start the transfer to HANA.");
    $('#dialogHTML1').css('height', 'auto');
    $('#modaldlg').css('height', 'auto');
    $('#modaldlg').css('width', '720px');
    $('#myModal').appendTo("body").modal('show');
}

function pushGit() {
    $('#modal-header').html("Push HANA Repo to Github");
    $('#dialogHTML1').html("Click save to start the transfer to GitHub.");
    $('#dialogHTML1').css('height', 'auto');
    $('#modaldlg').css('height', 'auto');
    $('#modaldlg').css('width', '720px');
    $('#myModal').appendTo("body").modal('show');
}

function pushToGitHub() {
    var comment = prompt("Please enter a commit comment", "Commit");
    $('#dialogHTML1').html("");
    $.ajax({
        type: "GET",
        url: HanaRepoService + HanaPackage + "?depth=-1",
        success: function(files) {
            loopThroughFiles(files, comment);
            $("#loadspinner").css('display', 'none');
        },
        error: function(err) {
            $("#loadspinner").css('display', 'none');
        }
    });
}

function loopThroughFiles(files, comment) {
    $.each(files["Children"], function(obj) {
        if (this.Directory !== true) {
            var objFile = this;
            try {
                data1 = $.ajax({
                    type: "GET",
                    url: HanaRepoService + objFile.RunLocation.substring(1),
                    async: false
                }).responseText;


                repo.write($('#RepoBranch').val(), objFile.RunLocation.replace(HanaPackage, '').substring(1), data1, comment, function(err) {
                    if (err) {
                        $('#dialogHTML1').append("<br /><b>Error pushing file:</b> " + objFile.RunLocation.substring(1));
                    } else {
                        updateVersion(objFile.RunLocation, JSON.parse(objFile.SapBackPack).Version, "commitfile");
                        $('#dialogHTML1').append("<br />Pushed file: " + objFile.RunLocation.substring(1));
                    }
                });
            } catch (err) {
                $('#dialogHTML1').append("<br /><b>Error pushing file: " + "" + "</b>");
            }
        } else {
            loopThroughFiles(this, comment);
        }
    });
}

function pullFromGithub() {
    saveType = 'Pull';
    $('#dialogHTML1').html("");
    repo = github.getRepo(gitUsername, $('#GitRepo').val());
    repo.getTree($('#RepoBranch').val() + '?recursive=true', function(err, tree) {
        tree.forEach(function(obj) {
            try {
                repo.read($('#RepoBranch').val(), obj.path, function(err, data2) {
                    saveToHana(data2, obj.path, obj.type);
                    $('#dialogHTML1').append("<br />Pulled file: " + obj.path);
                });
            } catch (err) {
                $('#dialogHTML1').append("<br /><b>Error pulling file: " + obj.path + "</b>");
            }
        });
        $('#hanasystem').html('');
        loadHanaPackageContents(HanaPackage, $('#hanasystem'));
    });
}