---
layout: post
title: "Bitnami Redmine Advanced SVN Integration"
published: false
---

Author: Lane Moseley   
Date: 8/2/2019

### Important Notes on the Bitnami Redmine Stack:
The Bitnami Redmine Stack is a very clean and simple way of installing Redmine.
It also has the advantage of being well supported and documented. It avoids the
hassle of having to install mysql, ruby, rails, subversion, etc individually.
However, there are some important things to keep in mind:
  
  1) All commands must be run from inside the Bitnami Stack Environment for Redmine.   
     ```sudo <install_dir>/use_redmine```

  2) The actual Redmine application directory is in '<install_dir>/apps/redmine/htdocs'.

### Bitnami Redmine Install on CentOS7
Download the installer:
  https://bitnami.com/redirect/to/622172/bitnami-redmine-4.0.4-3-linux-x64-installer.run?with_popup_skip_signin=1

Enable execution of installer:
  sudo chmod u+x <installer_name>.run
  
Run installer as sudo (this will install it in the /opt directory):
  sudo ./<installer_name>.run
  
When prompted make sure to un-check 'launch in cloud' option.

Once installed, the application will be visible from 'localhost' or the public
ip address given by 'hostname -I'. If the site is not visible from the public ip
address, the firewall must be disabled.

To disable the firewall (if necessary):
  sudo systemctl stop firewalld
  sudo systemctl disable firewalld
  sudo systemctl mask --now firewalld (this prevents other applications from restarting it)

### Migrate to the New Bitnami Redmine Installation
Migrate the mysql database:
  Generate a dump file of the old database (if there are multiple databases
  (_production, _development, _test), only the production database needs to be migrated):
    mysqldump redmine_production > dump_file.sql
  
  Migrate the database:
    sudo <install_dir>/use_redmine
    mysql -u username -p new_database_name < path/to/old_database_dump.sql

  Move the files directory over to the new location:
    For example, if migrating from TKL Redmine to Bitnami Redmine:
    Move "/var/www/<redmine_install_dir>/files" to "<install_dir>/apps/redmine/htdocs/files"

  Restart all services:
    Using the command line:
      sudo <install_dir>/ctlscript.sh restart

    Using the UI:
      sudo <install_dir>/manager-linux-x64.run
      click the 'Manage Servers' tab
      click 'Restart All'

  If the hostname has changed, update the hostname by logging into the Redmine application,
  going to Administration->Settings->General and updating the hostname field.
  This will fix most issues related to changing the hostname, but some links may
  still need to be fixed manually (i.e. in the wiki).

  If hostname field was edited, restart all services again.

### Bitnami Redmine Advanced SVN Integration on CentOS7
Most of the following steps are from https://docs.bitnami.com/installer/apps/redmine/configuration/use-subversion/
but some steps have been adjusted and added as needed.

Load the Bitnami Stack Environment for Redmine:
  sudo <install_dir>/use_redmine

In "<install_dir>/apache2/conf/httpd.conf":
  Ensure that the following lines are un-commented:
    LoadModule dav_module modules/mod_dav.so
    LoadModule dav_svn_module modules/mod_dav_svn.so
  
  Add the following to the bottom of the 'LoadModule' statement block:
    LoadModule perl_module modules/mod_perl.so

Add the following lines to "<install_dir>/apache2/bin/envvars":
  LD_LIBRARY_PATH="<install_dir>/perl/lib/5.16.3/x86_64-linux-thread-multi/CORE/:$LD_LIBRARY_PATH"
  export LD_LIBRARY_PATH

Copy the Redmine.pm file into the Perl modules folder:
  cp <install_dir>/apps/redmine/htdocs/extra/svn/Redmine.pm <install_dir>/perl/lib/site_perl/5.16.3/*/Apache2/

If a directory for the SVN repositories does not already exist, create it:
  mkdir /srv/repos
  mkdir /srv/repos/svn
  chown root:daemon /srv/repos/
  chown root:daemon /srv/repos/svn/
  chmod 0755 /srv/repos
  chmod 0750 /srv/repos/svn

  Note: It doesn't matter where the directories are created as long as the permissions are correct.
        Just adjust the directory path as needed in the following steps.

If migrating old SVN repositories to a new server:
  If possible use the same path. This makes it possible to simply copy the root
  repository directory to the new server and re-adjust permissions.

  For example, if repositories were located in '/srv/repos/svn' on the old server:
  mkdir /srv/repos
  scp -r old_user@old_host:/srv/repos/svn /srv/repos
  chown -R root:daemon /srv/repos/
  chown -R root:daemon /srv/repos/svn/
  chmod -R 0755 /srv/repos
  chmod -R 0750 /srv/repos/svn

Add the following to "<install_dir>/apps/redmine/conf/httpd-app.conf"
(some fields and paths must be filled in):
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

Install additional dependencies:
  gem install activeresource -v 3.2.22.1 (version IS important here)
  cpan -f DBD::mysql

Restart the server:
  <install_dir>/ctlscript.sh restart apache

Log in to the Redmine application as administrator and navigate to
“Settings -> Repositories -> Enable WS for repository management”.

Click “Generate a key” and save the key.

Add the following line in the crontab (you can edit the crontab using 'crontab -e', some fields need to be filled in):
*/2 * * * * <install_dir>/ruby/bin/ruby <install_dir>/apps/redmine/htdocs/extra/svn/reposman.rb --redmine localhost:YOUR_APACHE_PORT/redmine --svn-dir <path_to>/svn --owner root --group daemon --command="<install_dir>/subversion/bin/svnadmin create --pre-1.6-compatible --fs-type fsfs" --url http://localhost:YOUR_APACHE_PORT/svn --key="YOUR_API_KEY" --verbose >> /var/log/reposman.log

Check that everything works properly creating a project from the Redmine
application and checking the /var/log/reposman.log file.

Remember:
  For authentication to work correctly, the admin must add users to each project
  through the Redmine application interface.

### Bitnami Redmine Backup and Restore
https://docs.bitnami.com/aws/apps/redmine/administration/backup-restore/
https://www.if-not-true-then-false.com/2012/svn-subversion-backup-and-restore/

https://www.eversql.com/how-to-backup-mysql-database-using-mysqldump-without-locking/
"By default, the mysqldump utility, which allows to back a MySQL database,
will perform a lock on all tables until the backup is complete."

From https://stackoverflow.com/questions/1162045/bitnami-redmine-backup-strategy :
# Database
mysqldump -u<username> -p<password> <redmine_database> | gzip > /path/to/backup/db/redmine_`date +%y_%m_%d`.gz

# Attachments
rsync -a <install_dir>/apps/redmine/htdocs/files /path/to/backup/files

Files changed during original install:
  crontab
  <install_dir>/apache2/conf/httpd.conf
  <install_dir>/apache2/bin/envvars
  <install_dir>/apps/redmine/conf/httpd-app.conf


