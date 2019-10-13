---
layout: post
published: true
pinned: false

title: Converting Video and Removing Timestamps
author: Lane Moseley
---

Recently, I found myself needing to send a bunch of old videos to a friend. These videos were stored on my old MacBook, so they were all in .mov format. My friend doesn't have a Mac, so I decided to convert the videos before sending them off. Additionally, these files had been moved from Mac to Windows to Linux and back to Windows. Somewhere in between moves the filenames had been changed to include a timestamp, which I wanted to remove as well. In order to avoid the tedium of doing this by hand, I automated the process.

The timestamps were wrapped in parenthesis and were all located at the end of the filename, so I was able to create a simple Python script to remove that last set of parenthesis:
```python
import sys

# if string does not contain a left parenthesis, print original
if sys.argv[1].rfind('(') < 0:
    print(sys.argv[1])

# else, remove the timestamp and print an updated string
else:
    result = sys.argv[1][:sys.argv[1].rfind('(')].strip()
    result += sys.argv[1][sys.argv[1].rfind(')') + 1:]
    print(result)
```

Next, I used the script to help rename all of the files:
```bash
for f in ./*; do mv "$f" "$(python3 script.py "$f")"; done;
```

After cleaning up the filenames, I used [FFmpeg](https://ffmpeg.org/) to convert the videos in bulk to .mp4:
```bash
for f in *.mov; do ffmpeg -i "$f" -q:v 0 "${f%.*}.mp4"; done
```

And that's it! Hopefully this information can be of help to others going through the same process.