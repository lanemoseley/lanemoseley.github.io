---
layout: post
title: "Migrate Redmine Between Servers"
published: true
---
Author: Lane Moseley

### Migrate the MySQL Database
* Generate a dump file of the old database (if there are multiple databases
  (_production, _development, _test), only the production database needs to be migrated):  
```mysqldump redmine_production > dump_file.sql```
  
* Migrate the database:  
```mysql -u username -p new_database_name < path/to/old_database_dump.sql```

### Migrate the Files Directory
* For example, if migrating from TKL Redmine to Bitnami Redmine:
    Move or copy the contents of ```/var/www/<redmine_install_dir>/files``` to ```<install_dir>/apps/redmine/htdocs/files```

### Migrate SVN Repositories
* When migrating SVN repositories to a new server try to use the same path. This makes it possible to simply copy the root repository directory to the new server and re-adjust permissions.
  * For example, if repositories were located in ```/srv/repos/svn``` on the old server:  
    ```mkdir /srv/repos```  
    ```scp -r old_user@old_host:/srv/repos/svn /srv/repos```  
    ```chown -R root:daemon /srv/repos/```  
    ```chown -R root:daemon /srv/repos/svn/```  
    ```chmod -R 0755 /srv/repos```  
    ```chmod -R 0750 /srv/repos/svn```

### Final Notes
* If the hostname has changed, update the hostname by logging into the Redmine application,
  going to "Administration->Settings->General" and updating the hostname field.
  This will fix most issues related to changing the hostname, but some links may
  still need to be fixed manually (i.e. links in the wiki).
* Don't forget to restart Apache, MySQL, and Subversion.
