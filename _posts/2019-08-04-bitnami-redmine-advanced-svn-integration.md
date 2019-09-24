---
layout: post
published: true
pinned: false

title: Bitnami Redmine Advanced SVN Integration on CentOS 7
author: Lane Moseley
---

### Important Notes on the Bitnami Redmine Stack:
The Bitnami Redmine Stack is a very clean and simple way of installing Redmine.
It also has the advantage of being well supported and documented. It avoids the
hassle of having to install mysql, ruby, rails, subversion, etc individually.
However, there are some important things to keep in mind:
  
* All commands must be run from inside the Bitnami Stack Environment for Redmine.   
   * To start this environment: ```sudo <install_dir>/use_redmine```

* The actual Redmine application directory (the directory structure you're used to if you've used plain vanilla Redmine or TKL-Redmine before) is in ```<install_dir>/apps/redmine/htdocs```

### Bitnami Redmine Install on CentOS 7
* Download the appropriate [installer](https://bitnami.com/stack/redmine)
   * For this tutorial, the [Linux installer](https://bitnami.com/redirect/to/622172/bitnami-redmine-4.0.4-3-linux-x64-installer.run?with_popup_skip_signin=1) was used to install Bitnami Redmine on CentOS 7

* Enable execution of installer: ```sudo chmod u+x ~/Downloads/<installer_name>.run```
  
* Run installer as sudo (this will install it in the /opt directory): ```sudo ./<installer_name>.run```
   * If hosting Redmine locally, when prompted un-check *launch in cloud* option

### Bitnami Redmine Advanced SVN Integration on CentOS7
*Source: [https://docs.bitnami.com/installer/apps/redmine/configuration/use-subversion/](https://docs.bitnami.com/installer/apps/redmine/configuration/use-subversion/)*

* Load the Bitnami Stack Environment for Redmine: ```sudo <install_dir>/use_redmine```

* In ```<install_dir>/apache2/conf/httpd.conf```:
   * Ensure that the following lines are un-commented:  
     ```LoadModule dav_module modules/mod_dav.so```  
     ```LoadModule dav_svn_module modules/mod_dav_svn.so```
   * Add the following to the bottom of the *LoadModule* statement block:  
     ```LoadModule perl_module modules/mod_perl.so```

* Add the following lines to ```<install_dir>/apache2/bin/envvars```:  
{% highlight bash %}
LD_LIBRARY_PATH="<install_dir>/perl/lib/5.16.3/x86_64-linux-thread-multi/CORE/:$LD_LIBRARY_PATH"
export LD_LIBRARY_PATH
{% endhighlight %}

* Copy the Redmine.pm file into the Perl modules folder:  
{% highlight bash %}
cp <install_dir>/apps/redmine/htdocs/extra/svn/Redmine.pm <install_dir>/perl/lib/site_perl/5.16.3/*/Apache2/
{% endhighlight %}

* If a directory for the SVN repositories does not already exist, create it:  
  ```mkdir /srv/repos```  
  ```mkdir /srv/repos/svn```  
  ```chown root:daemon /srv/repos/```  
  ```chown root:daemon /srv/repos/svn/```  
  ```chmod 0755 /srv/repos```  
  ```chmod 0750 /srv/repos/svn```

  * Note: It doesn't matter where the directories are created as long as the permissions are correct. Just adjust the SVN repository path as needed in the following steps.

* Alternatively, if migrating old SVN repositories to a new server try to use the same path. This makes it possible to simply copy the root repository directory to the new server and re-adjust permissions.
  * For example, if repositories were located in ```/srv/repos/svn``` on the old server:  
    ```mkdir /srv/repos```  
    ```scp -r old_user@old_host:/srv/repos/svn /srv/repos```  
    ```chown -R root:daemon /srv/repos/```  
    ```chown -R root:daemon /srv/repos/svn/```  
    ```chmod -R 0755 /srv/repos```  
    ```chmod -R 0750 /srv/repos/svn```

* Add the following to ```<install_dir>/apps/redmine/conf/httpd-app.conf```
(some fields and paths must be filled in):  
{% highlight bash %}
  PerlLoadModule Apache2::Redmine
  <Location /svn>
    DAV svn
    SVNParentPath "<path_to>/svn"
    Order deny,allow
    Deny from all
    Satisfy any

    PerlAccessHandler Apache::Authn::Redmine::access_handler
    PerlAuthenHandler Apache::Authn::Redmine::authen_handler
    AuthType Basic
    AuthName "Redmine SVN Repository"
    AuthUserFile /dev/null

    #read-only access
    <Limit GET PROPFIND OPTIONS REPORT>
      Require valid-user
      Allow from localhost
      Satisfy any
    </Limit>
    # write access
    <LimitExcept GET PROPFIND OPTIONS REPORT>
      Require valid-user
    </LimitExcept>

    ## for mysql
    RedmineDSN "DBI:mysql:database=bitnami_redmine;host=localhost;mysql_socket=<install_dir>/mysql/tmp/mysql.sock"

    RedmineDbUser "bitnami"
    RedmineDbPass "bitnami_database_password"
    #You can find this value at installdir/apps/redmine/htdocs/config/database.yml
  </Location>
{% endhighlight %}

* Install additional dependencies:  
  ```gem install activeresource -v 3.2.22.1``` __(version is important here)__  
  ```yum install gcc -y```  
  ```yes | cpan -f DBD::mysql```  

* Restart the server:  
  ```<install_dir>/ctlscript.sh restart apache```

* Log in to the Redmine application as administrator and navigate to
“Settings -> Repositories -> Enable WS for repository management”. Click “Generate a key” and save the key for the next step.

* Add the following line in the crontab (you can edit the crontab using ```crontab -e```, some fields need to be filled in):  
{% highlight bash %}
*/2 * * * * <install_dir>/ruby/bin/ruby <install_dir>/apps/redmine/htdocs/extra/svn/reposman.rb --redmine localhost:YOUR_APACHE_PORT/redmine --svn-dir <path_to>/svn --owner root --group daemon --command="<install_dir>/subversion/bin/svnadmin create --pre-1.6-compatible --fs-type fsfs" --url http://localhost:YOUR_APACHE_PORT/svn --key="YOUR_API_KEY" --verbose >> /var/log/reposman.log
{% endhighlight %}

* Check that everything works properly creating a project from the Redmine
application and checking the ```/var/log/reposman.log``` file. *Remember that for authentication to work correctly, the admin must add users to each project through the Redmine application interface.*
