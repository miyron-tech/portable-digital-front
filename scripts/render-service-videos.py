"""Render original IT motion scenes and the landing page's warm LED treatment.

Requires Pillow and ffmpeg. Run from any directory. No external footage.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
from pathlib import Path
import math
import random
import subprocess

OUT = Path(__file__).resolve().parents[1] / 'public' / 'videos'
W, H, FPS, SECONDS = 1280, 720, 24, 12
SW, SH = 640, 360
random.seed(23)
TRACES = [(random.uniform(-3, 3), random.uniform(-2, 2), random.uniform(.4, 1.5)) for _ in range(55)]
MASK = Image.new('L', (W,H), 0)
md = ImageDraw.Draw(MASK)
for x in range(0, W, 6):
    for y in range(0, H, 18): md.rounded_rectangle((x+1,y+1,x+4,y+16),radius=1,fill=255)

def project(p,t):
    x,y,z = p
    angle = -.38 + math.sin(t*math.tau)*.13
    x,z = x*math.cos(angle)+z*math.sin(angle), -x*math.sin(angle)+z*math.cos(angle)
    angle2 = -.22 + math.cos(t*math.tau)*.04
    y,z = y*math.cos(angle2)-z*math.sin(angle2), y*math.sin(angle2)+z*math.cos(angle2)
    scale = 65/(1+z*.075)
    return (int(SW*.65+x*scale), int(SH*.48+y*scale))

def path(draw, pts, t, color=190, width=1):
    draw.line([project(p,t) for p in pts],fill=int(color),width=width,joint='curve')

def face(draw, pts, t, color=40):
    draw.polygon([project(p,t) for p in pts],fill=int(color))

def box(draw,x,y,z,w,h,d,t,light=70):
    a=(x,y,z); b=(x+w,y,z); c=(x+w,y+h,z); e=(x,y+h,z)
    aa=(x,y,z+d); bb=(x+w,y,z+d); cc=(x+w,y+h,z+d); ee=(x,y+h,z+d)
    face(draw,[a,aa,bb,b],t,light*.5); face(draw,[b,bb,cc,c],t,light*.8)
    face(draw,[a,b,c,e],t,light*.25)
    for pts in ([a,b,c,e,a],[a,aa,bb,b],[b,bb,cc,c]): path(draw,pts,t,light,2)

def chip(draw,t):
    for n,(x,y,l) in enumerate(TRACES):
        if abs(x)<1.25 and abs(y)<1.05: continue
        pts=[(x,y,.65),(x*.75,y,.65),(x*.75,y*.65,.65),(x*.25,y*.65,.65)]
        path(draw,pts,t,40+n%4*12,1)
        a=(t*2+n*.137)%1
        p=pts[int(a*3)]; q=pts[min(3,int(a*3)+1)]; u=(a*3)%1
        dot=tuple(p[i]*(1-u)+q[i]*u for i in range(3)); px,py=project(dot,t)
        draw.ellipse((px-2,py-2,px+2,py+2),fill=220)
    box(draw,-1.1,-1.05,-.1,2.2,2.1,.55,t,150)
    box(draw,-.85,-.8,-.18,1.7,1.6,.1,t,90)
    for i in range(16):
        p=-.99+i*.133
        for sign in [-1,1]:
            path(draw,[(p,sign*1.08,.06),(p,sign*1.38,.3)],t,120+100*math.sin(t*math.tau+i*.6)**8,2)
            path(draw,[(sign*1.13,p,.06),(sign*1.46,p,.3)],t,110,2)
    for i in range(10):
        y=-.65+i*.14
        path(draw,[(-.65,y,-.2),(.65,y,-.2)],t,35,1)
    pulse=160+70*math.sin(t*math.tau)**2
    # Computational core, not a coin: a luminous nested square die.
    for a in [.48,.32,.16]: path(draw,[(-a,-a,-.25),(a,-a,-.25),(a,a,-.25),(-a,a,-.25),(-a,-a,-.25)],t,pulse,2)

def servers(draw,t):
    for rack in range(3):
        x=-2.45+rack*1.65; z=rack*.32
        box(draw,x,-1.6,z,1.4,3.25,.7,t,70)
        for unit in range(7):
            y=-1.4+unit*.43
            box(draw,x+.1,y,z-.08,1.2,.31,.1,t,95)
            for slot in range(5):
                p=x+.18+slot*.13
                path(draw,[(p,y+.08,z-.12),(p,y+.23,z-.12)],t,50,2)
            px,py=project((x+1.08,y+.15,z-.14),t)
            power=230 if ((t*18+unit+rack*2)%4)<1.2 else 75
            draw.ellipse((px-2,py-2,px+2,py+2),fill=power)
            scan=(t*2+unit*.1+rack*.2)%1
            path(draw,[(x+.15,y+.3,z-.16),(x+.15+scan,y+.3,z-.16)],t,130,1)
    for i in range(18):
        phase=(t+i/18)%1
        x=-3+phase*6
        path(draw,[(x,1.95,.2),(x+.18,1.95,.2)],t,120,2)

def code(draw,t):
    for layer in range(3):
        z=1.2-layer*.6; x=-2.3+layer*.46; y=-1.35+layer*.15
        box(draw,x,y,z,3.85,2.45,.12,t,70+layer*30)
        path(draw,[(x,y+.28,z-.01),(x+3.85,y+.28,z-.01)],t,100)
        for button in range(3):
            px,py=project((x+.16+button*.16,y+.14,z-.05),t)
            draw.ellipse((px-2,py-2,px+2,py+2),fill=100+button*35)
        if layer==2:
            for line in range(11):
                yy=y+.48+line*.157; indent=(line%4)*.16
                available=1 if line<8 else min(1,((t*3+line*.15)%1)*2)
                for part in range(3):
                    xx=x+.25+indent+part*.8; length=(.25+((line*7+part*3)%5)*.1)*available
                    path(draw,[(xx,yy,z-.06),(xx+length,yy,z-.06)],t,80+(line+part)%3*65,2)
            cy=y+.48+(int(t*22)%11)*.157
            path(draw,[(x+3.4,cy-.04,z-.1),(x+3.4,cy+.08,z-.1)],t,240,2)
    # Packet paths moving through the application layers.
    for n in range(12):
        p=(t*1.5+n/12)%1
        px,py=project((-3+p*6,1.7+math.sin(p*5+n)*.2,.4),t)
        draw.rectangle((px,py,px+4,py+2),fill=145)

def led(frame):
    low=frame.resize((W//6,H//18),Image.BOX)
    low=low.point(lambda v:min(255,int(v*2.7)))
    halo=low.filter(ImageFilter.GaussianBlur(2))
    low=ImageChops.screen(low,halo)
    lut_r=[int(255*min(1,(v/255)**1.08*2.4)) for v in range(256)]
    lut_g=[int(255*min(1,(v/255)**2.2*1.25)) for v in range(256)]
    lut_b=[int(255*min(1,(v/255)**4.3*.8)) for v in range(256)]
    rgb=Image.merge('RGB',[low.point(lut) for lut in (lut_r,lut_g,lut_b)]).resize((W,H),Image.NEAREST)
    rgb=ImageChops.multiply(rgb,Image.merge('RGB',[MASK]*3))
    return ImageChops.screen(rgb, rgb.filter(ImageFilter.GaussianBlur(10)).point(lambda v:int(v*.55)))

def render(name, painter):
    destination=OUT/f'services-{name}.mp4'
    proc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(destination)],stdin=subprocess.PIPE)
    for index in range(FPS*SECONDS):
        t=index/(FPS*SECONDS)
        frame=Image.new('L',(SW,SH),0); draw=ImageDraw.Draw(frame)
        painter(draw,t)
        result=led(frame)
        if index==FPS: result.save(OUT/f'services-{name}.jpg',quality=90)
        proc.stdin.write(result.tobytes())
    proc.stdin.close()
    if proc.wait()!=0: raise RuntimeError(name)
    print(f'Rendered {destination}',flush=True)

if __name__=='__main__':
    for name,painter in [('engineering',chip),('infrastructure',servers),('development',code)]: render(name,painter)
