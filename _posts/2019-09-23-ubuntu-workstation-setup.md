---
layout: post
title: "Ubuntu Workstation Setup"
published: true
---
Author: Lane Moseley

#### Installs:

```bash
sudo apt-get update; sudo apt-get install \
git vim network-manager-vpnc-gnome astyle doxygen graphviz valgrind \
g++ build-essential freeglut3-dev mesa-utils \
python3-pip -y
```

* Usages for some of the above packages:
    * ```network-manager-vpnc-gnome``` is necessary for connecting any Cisco VPN
    * ```astyle``` for code formatting
    * ```doxygen graphviz``` for code documentation (especially C/C++)
    * ```valgrind``` is very useful for finding memory leaks in C/C++ programs
    * ```g++ build-essential``` for general C++ development
    * ```freeglut3-dev``` provides OpenGL tools
    * ```mesa-utils``` provides Mesa GL utilities

#### To show the date in top bar next to the time:
```bash
gsettings set org.gnome.desktop.interface clock-show-date true
```