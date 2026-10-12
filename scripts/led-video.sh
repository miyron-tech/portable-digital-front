#!/usr/bin/env bash
# LED-эффект фонового видео лендинга: пикселизация ячейками 8×27, вертикальные
# «светодиоды» по маске led-mask.png, градиент чёрный → красный → оранжевый →
# бледно-жёлтый и свечение.
#
# Usage: scripts/led-video.sh <input> <output.mp4> <pre-filter> [опции ffmpeg для входа]
#   pre-filter приводит исходник к 1920x1080 на чёрном фоне (хромакей, кроп, яркость).
#   Пример (ролик на зелёном фоне):
#   scripts/led-video.sh in.mp4 public/videos/out.mp4 \
#     "chromakey=0x00FF00:0.28:0.06,despill=type=green,scale=1920:1080,format=yuva420p[k];color=black:s=1920x1080:r=24[bg];[bg][k]overlay=shortest=1" -t 14
set -euo pipefail
in=$1; out=$2; pre=$3; shift 3
dir=$(cd "$(dirname "$0")" && pwd)
L='(0.3*r(X,Y)+0.59*g(X,Y)+0.11*b(X,Y))/255'
GRADE="geq=r='255*min(1,pow($L,1.25)*2.3)':g='255*min(1,pow($L,2.4)*1.25)':b='255*min(1,pow($L,4.5)*0.85)'"
ffmpeg -v error -y "$@" -i "$in" -loop 1 -i "$dir/led-mask.png" -filter_complex "
[0:v]$pre,fps=24,scale=240:40:flags=area,format=gbrp,split[l0][l1];[l1]gblur=sigma=6,lutrgb=r='min(val*1.5,255)':g='min(val*1.5,255)':b='min(val*1.5,255)'[halo];[l0][halo]blend=all_mode=screen:all_opacity=0.75,$GRADE,scale=1920:1080:flags=neighbor,format=gbrp[px];
[1:v]format=gbrp[m];
[px][m]blend=all_mode=multiply:shortest=1,gblur=sigma=0.7,split[a][b];
[b]gblur=sigma=26[glow];
[a][glow]blend=all_mode=screen:all_opacity=0.4,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 24 -profile:v high -movflags +faststart "$out"
