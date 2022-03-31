/* jQuery Switchable v2.0 | switchable.mrzhang.me | MIT Licensed */
(function(a) {
    function b(e, o, c) {
        var d = this,
            f = a(this),
            g = "beforeSwitch",
            h = "onSwitch";
        a.isFunction(o[g]) && f.bind(g, o[g]), a.isFunction(o[h]) && f.bind(h, o[h]), a.extend(d, {
            _initPlugins: function() {
                var k = a.switchable.Plugins,
                    i = k.length,
                    j = 0;
                for (; j < i; j++) {
                    k[j].init && k[j].init(d);
                }
            },
            _init: function() {
                d.container = e, d.config = o, !o.panels || !o.panels.jquery && a.type(o.panels) !== "string" ? d.panels = e.children() : d.panels = e.find(o.panels), d.length = Math.ceil(d.panels.length / o.steps);
                if (d.length < 1) {
                    window.console && console.warn("No panel in " + c);
                    return;
                }
                d.index = o.initIndex === null ? undefined : o.initIndex + (o.initIndex < 0 ? d.length : 0), o.effect === "none" && d.panels.slice(d.index * o.steps, (d.index + 1) * o.steps).show();
                if (!!o.triggers) {
                    var k, l, j, i = [];
                    for (l = 1; l <= d.length; l++) {
                        i.push('<a href="javascript:;">' + l + "</a>");
                    }
                    if (o.triggers.jquery) {
                        if (o.triggers.length > 1) {
                            d.triggers = o.triggers.slice(0, d.length);
                        } else {
                            o.triggers.html('<div class="' + o.triggersWrapCls + '">' + i.join("") + "</div>");
                            d.triggers = o.triggers.find("a");
                        }
                    } else {
                        d.triggers = a("<div />", {
                            "class": o.triggersWrapCls,
                            html: i.join("")
                        })[o.putTriggers](e).find("a");
                    }
                    d.triggers.eq(d.index).addClass(o.currentTriggerCls);
                    for (l = 0; l < d.length; l++) {
                        k = d.triggers.eq(l), k.click({
                            index: l
                        }, function(m) {
                            j = m.data.index;
                            if (!d._triggerIsValid(j)) {
                                return;
                            }
                            d._cancelDelayTimer(), d.switchTo(j);
                        }), o.triggerType === "mouse" && k.mouseenter({
                            index: l
                        }, function(m) {
                            j = m.data.index;
                            if (!d._triggerIsValid(j)) {
                                return;
                            }
                            d._delayTimer = setTimeout(function() {
                                d.switchTo(j);
                            }, o.delay * 1000);
                        }).mouseleave(function() {
                            d._cancelDelayTimer();
                        });
                    }
                }
            },
            _triggerIsValid: function(i) {
                return d.index !== i;
            },
            _cancelDelayTimer: function() {
                d._delayTimer && (clearTimeout(d._delayTimer), d._delayTimer = undefined);
            },
            _switchTrigger: function(i, j) {
                d.triggers.eq(i).removeClass(o.currentTriggerCls).end().eq(j).addClass(o.currentTriggerCls);
            },
            _switchPanels: function(k, i, j) {
                a.switchable.Effects[o.effect].call(d, k, i, j);
            },
            willTo: function(i) {
                return i ? d.index > 0 ? d.index - 1 : o.loop ? d.length - 1 : !1 : d.index < d.length - 1 ? d.index + 1 : o.loop ? 0 : !1;
            },
            switchTo: function(k, i) {
                var j = a.Event(g);
                f.trigger(j, [k]);
                if (j.isDefaultPrevented()) {
                    return;
                }
                return d._switchPanels(d.index, k, i), !o.triggers || d._switchTrigger(d.index, k), d.index = k, j.type = h, f.trigger(j, [k]), d;
            }
        }), d._init(), d._initPlugins();
    }
    a.switchable = {
        Config: {
            triggers: !0,
            putTriggers: "insertAfter",
            triggersWrapCls: "triggers",
            currentTriggerCls: "current",
            panels: null,
            steps: 1,
            triggerType: "mouse",
            delay: 0.1,
            initIndex: 0,
            effect: "none",
            easing: "ease",
            duration: 0.5,
            loop: !0,
            beforeSwitch: null,
            onSwitch: null,
            api: !1
        },
        Effects: {
            none: function(i, j) {
                var c = this,
                    d = c.config;
                c.panels.slice(i * d.steps, (i + 1) * d.steps).hide().end().slice(j * d.steps, (j + 1) * d.steps).show();
            }
        },
        Plugins: []
    }, a.fn.switchable = function(e) {
        var f = a(this),
            g = f.length,
            h = f.selector,
            c = [],
            d;
        e = a.extend({}, a.switchable.Config, e), e.effect = e.effect.toLowerCase();
        for (d = 0; d < g; d++) {
            c[d] = new b(f.eq(d), e, h + "[" + d + "]");
        }
        return e.api ? c[0] : f;
    };
})(jQuery),
function(a) {
    function b() {
        var k = document.documentElement,
            l = ["Webkit", "Moz"],
            c = "transition",
            d = "",
            e;
        if (k.style[c] !== undefined) {
            d = c;
        } else {
            for (e = 0; e < 2; e++) {
                if (k.style[c = l[e] + "Transition"] !== undefined) {
                    d = c;
                    break;
                }
            }
        }
        return d;
    }
    a.switchable.Anim = function(k, l, c, d, e, f) {
        var g = this,
            h = {},
            i, j;
        a.switchable.Transition === undefined && (a.switchable.Transition = b()), i = a.switchable.Transition, a.extend(g, {
            isAnimated: !1,
            run: function() {
                if (g.isAnimated) {
                    return;
                }
                c = c * 1000;
                if (i) {
                    h[i + "Property"] = f || "all", h[i + "Duration"] = c + "ms", h[i + "TimingFunction"] = d, k.css(a.extend(l, h)), j = setTimeout(function() {
                        g._clearCss(), g._complete();
                    }, c);
                } else {
                    var n = /cubic-bezier\(([\s\d.,]+)\)/,
                        m = d.match(n),
                        o = a.switchable.TimingFn[d];
                    if (o || m) {
                        d = a.switchable.Easing(m ? m[1] : o.match(n)[1]);
                    }
                    k.animate(l, c, d, function() {
                        g._complete();
                    });
                }
                return g.isAnimated = !0, g;
            },
            stop: function(m) {
                if (!g.isAnimated) {
                    return;
                }
                return i ? (clearTimeout(j), j = undefined) : k.stop(!1, m), g.isAnimated = !1, g;
            },
            _complete: function() {
                e && e();
            },
            _clearCss: function() {
                h[i + "Property"] = "none", k.css(h);
            }
        });
    };
}(jQuery),
function(c) {
    function d(e) {
        return "cubic-bezier(" + e + ")";
    }

    function a(g) {
        var h = [],
            e = 101,
            f;
        for (f = 0; f <= e; f++) {
            h[f] = g.call(null, f / e);
        }
        return function(j) {
            if (j === 1) {
                return h[e];
            }
            var k = e * j,
                p = Math.floor(k),
                i = h[p],
                l = h[p + 1];
            return i + (l - i) * (k - p);
        };
    }

    function b(j, k, l, m, A, B) {
        function D(n) {
            return ((C * n + bx) * n + cx) * n;
        }

        function e(n) {
            return ((ay * n + by) * n + cy) * n;
        }

        function f(n) {
            return (3 * C * n + 2 * bx) * n + cx;
        }

        function g(n) {
            return 1 / (200 * n);
        }

        function h(n, o) {
            return e(i(n, o));
        }

        function i(u, v) {
            function t(w) {
                return w >= 0 ? w : 0 - w;
            }
            var n, o, p, q, r, s;
            for (p = u, s = 0; s < 8; s++) {
                q = D(p) - u;
                if (t(q) < v) {
                    return p;
                }
                r = f(p);
                if (t(r) < 0.000001) {
                    break;
                }
                p = p - q / r;
            }
            n = 0, o = 1, p = u;
            if (p < n) {
                return n;
            }
            if (p > o) {
                return o;
            }
            while (n < o) {
                q = D(p);
                if (t(q - u) < v) {
                    return p;
                }
                u > q ? n = p : o = p, p = (o - n) * 0.5 + n;
            }
            return p;
        }
        var C = bx = cx = ay = by = cy = 0;
        return cx = 3 * k, bx = 3 * (m - k) - cx, C = 1 - cx - bx, cy = 3 * l, by = 3 * (A - l) - cy, ay = 1 - cy - by, h(j, g(B));
    }
    c.switchable.TimingFn = {
        ease: d(".25, .1, .25, 1"),
        linear: d("0, 0, 1, 1"),
        "ease-in": d(".42, 0, 1, 1"),
        "ease-out": d("0, 0, .58, 1"),
        "ease-in-out": d(".42, 0, .58, 1")
    }, c.switchable.Easing = function(g) {
        var h, i, e = 0;
        g = g.split(","), i = g.length;
        for (; e < i; e++) {
            g[e] = parseFloat(g[e]);
        }
        if (i !== 4) {
            window.console && console.warn(d(g.join(", ")) + " missing argument.");
        } else {
            h = "cubic-bezier-" + g.join("-");
            if (!c.easing[h]) {
                var f = a(function(j) {
                    return b(j, g[0], g[1], g[2], g[3], 5);
                });
                c.easing[h] = function(o, p, j, n) {
                    return f.call(null, o);
                };
            }
        }
        return h;
    };
}(jQuery),
function(a) {
    a.extend(a.switchable.Config, {
        autoplay: !1,
        interval: 3,
        pauseOnHover: !0
    }), a.switchable.Plugins.push({
        name: "autoplay",
        init: function(d) {
            function e() {
                c = d.willTo(d.isBackward);
                if (c === !1) {
                    d._cancelTimers();
                    return;
                }
                d.switchTo(c, d.isBackward ? "backward" : "forward");
            }

            function f() {
                b = setInterval(function() {
                    e();
                }, (g.interval + g.duration) * 1000);
            }
            var g = d.config,
                h = !1,
                i, b, c;
            if (!g.autoplay || d.length <= 1) {
                return;
            }
            g.pauseOnHover && d.panels.add(d.triggers).hover(function() {
                d._pause();
            }, function() {
                h || d._play();
            }), a.extend(d, {
                _play: function() {
                    d._cancelTimers(), d.paused = !1, i = setTimeout(function() {
                        e(), f();
                    }, g.interval * 1000);
                },
                _pause: function() {
                    d._cancelTimers(), d.paused = !0;
                },
                _cancelTimers: function() {
                    i && (clearTimeout(i), i = undefined), b && (clearInterval(b), b = undefined);
                },
                play: function() {
                    return d._play(), h = !1, d;
                },
                pause: function() {
                    return d._pause(), h = !0, d;
                }
            }), d._play();
        }
    });
}(jQuery),
function(a) {
    a.extend(a.switchable.Config, {
        prev: null,
        next: null
    }), a.switchable.Plugins.push({
        name: "carousel",
        init: function(d) {
            var g = d.config,
                h = ["backward", "forward"],
                i = ["prev", "next"],
                b, c, e, f = 0;
            if (!g.prev && !g.next) {
                return;
            }
            for (; f < 2; f++) {
                b = i[f], c = g[b], c && (e = d[b + "Btn"] = c.jquery ? c : a(c), e.click({
                    direction: h[f]
                }, function(l) {
                    l.preventDefault();
                    if (!d.anim) {
                        var j = l.data.direction,
                            k = d.willTo(j === h[0]);
                        k !== !1 && d.switchTo(k, j);
                    }
                }));
            }
        }
    });
}(jQuery),
function(a) {
    a.switchable.Effects.fade = function(d, h) {
        var b = this,
            c = b.config,
            e = b.panels,
            f = e.eq(d),
            g = e.eq(h);
        b.anim && (b.anim.stop(), e.eq(b.anim.to).css({
            zIndex: b.length
        }).end().eq(b.anim.from).css({
            opacity: 0,
            zIndex: 1
        })), g.css({
            opacity: 1
        }), b.anim = (new a.switchable.Anim(f, {
            opacity: 0
        }, c.duration, c.easing, function() {
            g.css({
                zIndex: b.length
            }), f.css({
                zIndex: 1
            }), b.anim = undefined;
        }, "opacity")).run(), b.anim.from = d, b.anim.to = h;
    }, a.switchable.Plugins.push({
        name: "fade effect",
        init: function(c) {
            var g = c.config,
                b = c.panels.eq(c.index);
            if (g.effect !== "fade" || g.steps !== 1) {
                return;
            }
            c.panels.not(b).css({
                opacity: 0,
                zIndex: 1
            }), b.css({
                opacity: 1,
                zIndex: c.length
            });
        }
    });
}(jQuery),
function(e) {
    var f = ["scrollleft", "scrollright", "scrollup", "scrolldown"],
        a = "position",
        b = "absolute",
        c = "relative";
    e.extend(e.switchable.Config, {
        end2end: !1,
        groupSize: [],
        visible: null,
        clonedCls: "switchable-cloned"
    });
    for (var d = 0; d < 4; d++) {
        e.switchable.Effects[f[d]] = function(v, w, g) {
            var h = this,
                i = h.config,
                j = h.length - 1,
                k = g === "backward",
                l = i.end2end && (k && v === 0 && w === j || g === "forward" && v === j && w === 0),
                u = {};
            u[h.isHoriz ? "left" : "top"] = l ? h._adjustPosition(k) : -h.groupSize[h.isHoriz ? 0 : 1] * w, h.anim && h.anim.stop(), h.anim = (new e.switchable.Anim(h.panels.parent(), u, i.duration, i.easing, function() {
                l && h._resetPosition(k), h.anim = undefined;
            })).run();
        };
    }
    e.switchable.Plugins.push({
        name: "scroll effect",
        init: function(g) {
            var h = g.config,
                j = h.steps,
                l = g.panels,
                m = l.parent(),
                n = e.inArray(h.effect, f),
                o = n === 0 || n === 1,
                p = l.eq(0).outerWidth(!0),
                q = l.eq(0).outerHeight(!0),
                r = o ? 0 : 1,
                s = g.length - 1,
                t = o ? "left" : "top",
                i = {};
            if (n === -1) {
                return;
            }
            g.groupSize = [h.groupSize[0] || p * j, h.groupSize[1] || q * j];
            if (h.end2end) {
                var k = l.length,
                    u = !o && h.groupSize[0] ? g.groupSize[r] * g.length : (o ? p : q) * k,
                    v = k - s * j,
                    w = (o ? p : q) * v,
                    x = !o && h.groupSize[0] ? g.groupSize[r] : w,
                    M;
                h.loop = !0, h.visible && h.visible < k && h.visible > v && l.slice(0, h.visible).clone(!0).addClass(h.clonedCls).appendTo(m).click(function(y) {
                    y.preventDefault(), l.eq(e(this).index() - k).click();
                }), e.extend(g, {
                    _adjustPosition: function(y) {
                        return M = y ? s : 0, i[a] = c, i[t] = (y ? -1 : 1) * u, l.slice(M * j, (M + 1) * j).css(i), y ? x : -u;
                    },
                    _resetPosition: function(y) {
                        M = y ? s : 0, i[a] = "", i[t] = "", l.slice(M * j, (M + 1) * j).css(i), i[a] = undefined, i[t] = y ? -g.groupSize[r] * s : 0, m.css(i);
                    }
                });
            }
            g.container.css(a) == "static" && g.container.css(a, c), i[a] = b, i[t] = -g.groupSize[r] * g.index, m.css(i).css("width", o ? 2 * g.groupSize[r] * g.length : h.groupSize[0] ? h.groupSize[0] : undefined), g.isHoriz = o, g.isBackward = n === 1 || n === 3;
        }
    });
}(jQuery),
function(c) {
    var d = ["accordion", "horizaccordion"],
        a = [
            ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"],
            ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"]
        ];
    c.extend(c.switchable.Config, {
        multiple: !1,
        customProps: {}
    });
    for (var b = 0; b < 2; b++) {
        c.switchable.Effects[d[b]] = function(f, e) {
            var g = this,
                h = g.config,
                m = f !== e;
            g.anim && g.anim.stop(m), g.anim = (new c.switchable.Anim(g.panels.eq(e), g.triggers.eq(e).hasClass(h.currentTriggerCls) ? g.collapseProps : g.expandProps[e], h.duration, h.easing, function() {
                g.anim = undefined;
            })).run(), !h.multiple && f !== undefined && m && (g.anim2 && g.anim2.stop(m), g.anim2 = (new c.switchable.Anim(g.panels.eq(f), g.collapseProps, h.duration, h.easing, function() {
                g.anim2 = undefined;
            })).run());
        };
    }
    c.switchable.Plugins.push({
        name: "accordion effect",
        init: function(e) {
            var f = e.config,
                g = c.inArray(f.effect, d);
            if (g === -1 || f.steps !== 1) {
                return;
            }
            window.console && console.info("Remember to set the border-width for the accordion's panels, even without border."), c.extend(e, {
                _triggerIsValid: function(m) {
                    return !0;
                },
                _switchTrigger: function(o, p) {
                    var m = e.triggers,
                        n = f.currentTriggerCls;
                    m.eq(p).toggleClass(n), !f.multiple && o !== undefined && o !== p && m.eq(o).removeClass(n);
                }
            }), e.expandProps = [], e.collapseProps = {};
            var h = a[g].length,
                i = {},
                j, k, l;
            for (l = 0; l < h; l++) {
                e.collapseProps[a[g][l]] = 0;
            }
            c.extend(e.collapseProps, f.customProps);
            for (l = 0; l < e.length; l++) {
                j = e.panels.eq(l);
                for (var s = 0; s < h; s++) {
                    k = a[g][s], i[k] = j.css(k);
                }
                e.expandProps.push(c.extend({}, i)), j.css(c.extend({
                    overflow: "hidden"
                }, l === e.index ? i : e.collapseProps));
            }
        }
    });
}(jQuery);;
jQuery.extend(jQuery.easing, {
    def: "easeOutQuad",
    swing: function(e, f, a, h, g) {
        return jQuery.easing[jQuery.easing.def](e, f, a, h, g);
    },
    easeInQuad: function(e, f, a, h, g) {
        return h * (f /= g) * f + a;
    },
    easeOutQuad: function(e, f, a, h, g) {
        return -h * (f /= g) * (f - 2) + a;
    },
    easeInExpo: function(e, f, a, h, g) {
        return (f == 0) ? a : h * Math.pow(2, 10 * (f / g - 1)) + a;
    },
    easeOutExpo: function(e, f, a, h, g) {
        return (f == g) ? a + h : h * (-Math.pow(2, -10 * f / g) + 1) + a;
    },
    easeInBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158;
        }
        return i * (f /= h) * f * ((g + 1) * f - g) + a;
    },
    easeOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158;
        }
        return i * ((f = f / h - 1) * f * ((g + 1) * f + g) + 1) + a;
    },
    easeInOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158;
        }
        if ((f /= h / 2) < 1) {
            return i / 2 * (f * f * (((g *= (1.525)) + 1) * f - g)) + a;
        }
        return i / 2 * ((f -= 2) * f * (((g *= (1.525)) + 1) * f + g) + 2) + a;
    },
    easeOutBounce: function(j, i, b, c, d) {
        if ((i /= d) < (1 / 2.75)) {
            return c * (7.5625 * i * i) + b;
        } else {
            if (i < (2 / 2.75)) {
                return c * (7.5625 * (i -= (1.5 / 2.75)) * i + 0.75) + b;
            } else {
                if (i < (2.5 / 2.75)) {
                    return c * (7.5625 * (i -= (2.25 / 2.75)) * i + 0.9375) + b;
                } else {
                    return c * (7.5625 * (i -= (2.625 / 2.75)) * i + 0.984375) + b;
                }
            }
        }
    }
});
(function(a) {
    a.fn.menuAim = function(c) {
        this.each(function() {
            b.call(this, c);
        });
        return this;
    };

    function b(c) {
        var d = a(this),
            q = null,
            g = [],
            r = null,
            p = null,
            s = a.extend({
                rowSelector: "> li",
                submenuSelector: "*",
                submenuDirection: "right",
                tolerance: 75,
                enter: a.noop,
                exit: a.noop,
                activate: a.noop,
                deactivate: a.noop,
                exitMenu: a.noop
            }, c);
        var j = 3,
            f = 300;
        var e = function(t) {
            g.push({
                x: t.pageX,
                y: t.pageY
            });
            if (g.length > j) {
                g.shift();
            }
        };
        var o = function() {
            if (p) {
                clearTimeout(p);
            }
            if (s.exitMenu(this)) {
                if (q) {
                    s.deactivate(q);
                }
                q = null;
            }
        };
        var l = function() {
                if (p) {
                    clearTimeout(p);
                }
                s.enter(this);
                h(this);
            },
            k = function() {
                s.exit(this);
            };
        var m = function() {
            i(this);
        };
        var i = function(t) {
            if (t.className.toLowerCase() == "current") {
                return;
            }
            if (q) {
                s.deactivate(q);
            }
            s.activate(t);
            q = t;
        };
        var h = function(u) {
            var t = n();
            if (t) {
                p = setTimeout(function() {
                    h(u);
                }, t);
            } else {
                i(u);
            }
        };
        var n = function() {
            if (!q || !a(q).is(s.submenuSelector)) {
                return 0;
            }
            var x = d.offset(),
                t = {
                    x: x.left,
                    y: x.top - s.tolerance
                },
                E = {
                    x: x.left + d.outerWidth(),
                    y: t.y
                },
                G = {
                    x: x.left,
                    y: x.top + d.outerHeight() + s.tolerance
                },
                y = {
                    x: x.left + d.outerWidth(),
                    y: G.y
                },
                z = g[g.length - 1],
                D = g[0];
            if (!z) {
                return 0;
            }
            if (!D) {
                D = z;
            }
            if (D.x < x.left || D.x > y.x || D.y < x.top || D.y > y.y) {
                return 0;
            }
            if (r && z.x == r.x && z.y == r.y) {
                return 0;
            }

            function A(I, H) {
                return (H.y - I.y) / (H.x - I.x);
            }
            var C = E,
                u = y;
            if (s.submenuDirection == "left") {
                C = G;
                u = t;
            } else {
                if (s.submenuDirection == "below") {
                    C = y;
                    u = G;
                } else {
                    if (s.submenuDirection == "above") {
                        C = t;
                        u = E;
                    }
                }
            }
            var v = A(z, C),
                B = A(z, u),
                F = A(D, C),
                w = A(D, u);
            if (v < F && B > w) {
                r = z;
                return f;
            }
            r = null;
            return 0;
        };
        d.mouseleave(o).find(s.rowSelector).mouseenter(l).mouseleave(k).click(m);
        a(document).mousemove(e);
    }
})(jQuery);
var $window = $(window);
var NALA = NALA || {};
(function(a) {
    NALA.check = {
        stopStr: /找小妹|找小姐|找学生|整形|学生妹|人流|不孕不育|[发發髮]\s*票|[发發髮]\S+票/g,
        isPhone: function() {
            var b = navigator.userAgent.toLowerCase(),
                c = /iPhone|iPad|Android|ucweb|windows\s+mobile|Windows\s+Phone/i;
            return c.test(b);
        },
        isIE6: window.VBArray && !window.XMLHttpRequest,
        isNick: function(c) {
            var b = /^[\u4e00-\u9fa5A-Za-z0-9-_]+$/;
            return b.test(c);
        },
        isEmail: function(c) {
            var b = /^[a-z0-9][\w\.]*@([a-z0-9][a-z0-9-]*\.)+[a-z]{2,5}$/i;
            return b.test(c);
        },
        isMobile: function(c) {
            var b = /^1[345678][0-9]{9}$/;
            return b.test(c);
        },
        isTelephone: function(c) {
            var b = /^0\d{2,3}-\d{5,9}$/;
            return b.test(c);
        },
        isUrl: function(c) {
            var b = /^http:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?$/;
            return b.test(c);
        },
        isNum: function(c) {
            var b = /^[0-9]\d*$/;
            return b.test(c);
        }
    };
    if (NALA.check.isPhone()) {
        a("html").addClass("isPhone");
        NALA.isPhone = true;
    } else {
        if ($window.width() < 1400) {
            a("html").addClass("is1280");
        }
    }
    NALA.userInfo = {
        login: 0
    };
    NALA.common = {
        ajaxUrl: {
            userinfo: "/user/loginAuth3",
            cartData: "/cart/listJson",
            search: "/item/associateSearch"
        },
        cmsContentAjax: function(b, c) {
            a.ajax({
                url: "/common/ajaxCmsContent",
                cache: false,
                data: {
                    mark: b
                },
                dataType: "html",
                success: function(d) {
                    c(d);
                }
            });
        },
        searchBar: function() {
            var g = this,
                i = a("#search_fm"),
                f = i.find("input.sea_input"),
                b = {},
                j = null,
                e = -1;
            _offset = null, $result = null;
            i.submit(function() {
                if (a.trim(f.val()) == "请输入商品或品牌" || a.trim(f.val()) == "") {
                    location.href = "/item/newsearch";
                    return false;
                }
            });
            if (NALA.isPhone) {
                return;
            }
            $result = a('<div class="search_result"></div>').appendTo("#header");
            f.attr("autocomplete", "off").on("focus", function() {
                var k = a.trim(f.val());
                _offset = f.offset();
                c();
                if (k == "") {
                    return false;
                }
                if (k == "请输入商品或品牌") {
                    f.val("");
                } else {
                    if (b[k] != undefined) {
                        d(k);
                    } else {
                        h(k);
                    }
                }
                return false;
            }).on("keyup", function(k) {
                if (k.keyCode != 40 && k.keyCode != 38 && k.keyCode != 13) {
                    clearTimeout(j);
                    j = setTimeout(function() {
                        var l = a.trim(f.val());
                        if (b[l] != undefined) {
                            d(l);
                        } else {
                            h(l);
                        }
                    }, 300);
                }
            }).blur(function() {
                if (a.trim(f.val()) == "") {
                    f.val("请输入商品或品牌");
                }
            }).on("keydown", function(n) {
                var k = $result.find("li"),
                    l = k.length,
                    m = "";
                if (l > 0) {
                    switch (n.keyCode) {
                        case 40:
                            e++;
                            if (e > l - 1) {
                                e = 0;
                            }
                            k.removeClass("on").eq(e).addClass("on");
                            f.val(k.eq(e).text());
                            break;
                        case 38:
                            e--;
                            if (e < 0) {
                                e = l - 1;
                            }
                            k.removeClass("on").eq(e).addClass("on");
                            f.val(k.eq(e).text());
                            break;
                    }
                }
            });

            function h(k) {
                a.ajax({
                    url: g.ajaxUrl.search,
                    type: "post",
                    data: {
                        q: k
                    },
                    success: function(l) {
                        b[k] = l;
                        d(k);
                    }
                });
            }

            function d(l) {
                var k = "<ul>",
                    m = b[l].split(",");
                if (m[0] !== "") {
                    a.each(m, function(o, n) {
                        k += "<li>" + n + "</li>";
                    });
                    $result.html(k).css({
                        left: _offset.left,
                        top: _offset.top,
                        display: "block"
                    });
                    e = -1;
                } else {
                    $result.hide();
                }
            }

            function c() {
                a(document).on("click", function(k) {
                    if (k.target.id != "textfield") {
                        $result.hide();
                    }
                });
                $result.on("mouseenter", "li", function() {
                    var k = a(this);
                    e = k.index();
                    k.addClass("on").siblings("li").removeClass("on");
                    return false;
                }).on("click", "li", function() {
                    f.val(a(this).text());
                    setTimeout(function() {
                        i.submit();
                    }, 300);
                });
            }
        },
        showLoginInfo: function() {
            var e = this,
                f = a("#userinfo-bar"),
                c = a("#hd_cartnum"),
                g = msgTxt = "";
            a.ajax({
                url: e.ajaxUrl.userinfo,
                cache: false,
                dataType: "json",
                success: function(h) {
                    NALA.userInfo = h;
                    if (h.cart > 0) {
                        c.html(h.cart).css("visibility", "visible");
                    }
                    if (h.login) {
                        g = "";
                        if (h.level == 1) {
                            g = "vip-ico";
                        } else {
                            if (h.level == 2) {
                                g = "svip-ico";
                            }
                        }
                        a("#header_user").html('<a href="/home/" class="' + g + '">' + h.name + '</a>&nbsp;[<a href="/logout/ssoLogout">退出</a>]</li>');
                    }
                }
            });
            a("#favorite_wb").click(function() {
                d();
                return false;
            });
            a("#header_guanzhu").find(".more-bd").html('<div class="list"><p><iframe width="70" height="24" frameborder="0" allowtransparency="true" marginwidth="0" marginheight="0" scrolling="no" border="0" src="http://widget.weibo.com/relationship/followbutton.php?width=70&height=24&uid=5092874104&style=1&btn=red&dpc=1"></iframe></p></div>');
            b();

            function b() {
                var h = null;
                f.on("mouseenter", "li.more-menu", function() {
                    var i = a(this);
                    h = setTimeout(function() {
                        i.addClass("hover");
                        h = null;
                    }, 300);
                }).on("mouseleave", "li.more-menu", function() {
                    var i = a(this);
                    if (h !== null) {
                        clearTimeout(h);
                    } else {
                        h = setTimeout(function() {
                            i.removeClass("hover");
                        }, 300);
                    }
                });
            }

            function d() {
                var h = "http://www.lizi.com/",
                    j = "丽子美妆 - 专注化妆品售卖100年！";
                try {
                    window.external.addFavorite(h, j);
                } catch (i) {
                    try {
                        window.sidebar.addPanel(j, h, "");
                    } catch (i) {
                        alert("对不起，您的浏览器不支持此操作！\n请您使用菜单栏或Ctrl+D收藏本站。");
                    }
                }
            }
        },
        toolBar: function() {
            var e = this,
                c = null,
                g = null,
                b = null,
                f = null,
                d = HTML = wideHTML = "";
            if (NALA.isPhone) {
                return;
            }
            HTML = '<div class="tb_box" id="J_toolbar"><ul class="tb_bd"><li><a href="http://wpa.b.qq.com/cgi/wpa.php?ln=1&key=XzgwMDA0MjIzN181OTY5N184MDAwNDIyMzdfMl8" class="kefu" target="_blank"><p><img src="http://cdn.lizi.com/images/kong.gif" /><span>在线客服</span></p></a></li><li><a href="javascript:;" class="back2top"><p><img src="http://cdn.lizi.com/images/kong.gif" /><span>返回顶部</span></p></a></li></ul></div>';
            c = a(HTML).appendTo("body");
            c.on("click", "a.back2top", function() {
                a("body,html").animate({
                    scrollTop: 0
                }, 500);
                return false;
            });
        },
        head_cart_event: function() {
            var g = this,
                e = a("#head_cart"),
                b = e.find(".list"),
                f = null;
            e.on("mouseenter", function() {
                if (f !== null) {
                    clearTimeout(f);
                }
                f = setTimeout(function() {
                    e.addClass("hd_cart_hover");
                    if (e.data("loaded") !== "yes") {
                        d();
                    }
                }, 200);
            }).on("mouseleave", function() {
                if (f !== null) {
                    clearTimeout(f);
                }
                f = setTimeout(function() {
                    e.removeClass("hd_cart_hover");
                }, 200);
            });
            b.on("click", "a.del", function() {
                c(this);
            });

            function d() {
                a.ajax({
                    url: g.ajaxUrl.cartData,
                    cache: false,
                    dataType: "json",
                    success: function(j) {
                        var i = data_class = "";
                        if (j.status == 1) {
                            e.data("loaded", "yes");
                            a.each(j.data, function(l, k) {
                                var m = 0;
                                if (k.isTaoCan) {
                                    m = 1;
                                }
                                i += '<dl><dt><a target="_blank" href="/product-' + k.id + '.html"><img src="' + k.pic + '"></a></dt><dd><h4><a target="_blank" href="/product-' + k.id + '.html">' + k.name + '</a></h4><p><span class="red">￥' + k.price + "</span>&nbsp;<i>X</i>&nbsp;" + k.num + '</p><a class="iconfont del" title="删除" href="javascript:;" data-lid="' + k.l_id + '" data-taocan="' + m + '">&#x164;</a></dd></dl>';
                                if (l > 5) {
                                    data_class = " data_over";
                                }
                            });
                            i = '<div class="data' + data_class + '">' + i + '</div><div class="count">共<span class="red" id="hd_cart_count">' + j.count + '</span>件商品，满99元就包邮哦~<p>总价:<span class="red">￥<em id="hd_cart_total">' + j.total + '</em></span><a href="/cart/mycart" class="btn">去结算</a></p></div>';
                            b.html(i);
                            a("#hd_cartnum").html(j.count);
                        } else {
                            if (j.status == 0) {
                                h();
                            } else {
                                b.html('<p class="fail"><i class="iconfont">&#371;</i><br>购物车数据加载失败<br>请稍后再试</p>');
                            }
                        }
                    },
                    error: function(i) {
                        b.html('<p class="fail"><i class="iconfont">&#371;</i><br>购物车数据加载失败<br>请稍后再试 (' + i.status + ")</p>");
                    }
                });
            }

            function c(i) {
                var k = a(i),
                    j = k.data("lid");
                a.ajax({
                    url: "/cart/deleteBar",
                    type: "post",
                    dataType: "json",
                    data: {
                        idList: j
                    },
                    success: function(l) {
                        var m = l.totalCount;
                        a("#hd_cartnum").html(m);
                        if (m < 1) {
                            h();
                            return;
                        }
                        if (k.data("taocan") == 1) {
                            d();
                        } else {
                            k.parents("dl").remove();
                            a("#hd_cart_count").html(l.totalCount);
                            a("#hd_cart_total").html(l.totalPrice);
                            if (m < 7) {
                                b.find(".data").removeClass("data_over").css("zoom", "1");
                            }
                        }
                    },
                    error: function(l) {
                        NALA.dialog.warn("删除失败，请稍后再试 (" + l.status + ")");
                    }
                });
            }

            function h() {
                a("#hd_cartnum").css("visibility", "hidden");
                b.html('<p class="fail"><i class="iconfont">&#365;</i><br>购物车空啦<br>爱Ta，就带Ta来购物车吧</p>');
            }
        },
        mainNav_animate: function() {
            var h = this,
                b = a("#J_mainCata"),
                e = a("#J_subCata"),
                i = a("#main_nav"),
                l = null,
                k = null,
                d = false,
                g = false,
                f = false;
            if (a("#mall-slide").length > 0) {
                f = true;
            }
            b.find("ul").menuAim({
                activate: j,
                exitMenu: function() {
                    if (k !== null) {
                        clearTimeout(k);
                    }
                }
            });
            i.on("mouseenter", function() {
                var m = a(this);
                if (l !== null) {
                    clearTimeout(l);
                }
                if (f) {
                    return;
                }
                l = setTimeout(function() {
                    m.addClass("main_nav_hover");
                    b.stop().show().animate({
                        opacity: 1,
                        height: 398
                    }, 300);
                }, 200);
            }).on("mouseleave", function() {
                if (l !== null) {
                    clearTimeout(l);
                }
                l = setTimeout(function() {
                    e.css({
                        opacity: 0,
                        left: "100px"
                    }).find(".J_subView").hide();
                    g = false;
                    if (!f) {
                        b.stop().delay(200).animate({
                            opacity: 0,
                            height: 0
                        }, 300, function() {
                            i.removeClass("main_nav_hover");
                            b.hide().find("li").removeClass("current");
                        });
                    } else {
                        b.find("li").removeClass("current");
                    }
                }, 200);
            });

            function j(o) {
			
                var m = a(o),
                    n = m.index();
					
                if (n > 4) {
                    m.addClass("current").siblings("li").removeClass("current");
                    e.find(".J_subView").hide();
                    return false;
                }
                if (n > 1) {
                    e.css({
                        top: "198px"
                    });
                } else {
                    e.css({
                        top: "35px"
                    });
                } if (g) {
                    m.addClass("current").siblings("li").removeClass("current");
                    e.find(".J_subView").hide().eq(n).show();
                } else {
                    if (k !== null) {
                        clearTimeout(k);
                    }
                    k = setTimeout(function() {
                        m.addClass("current").siblings("li").removeClass("current");
                        g = true;
                        if (d) {
                            e.css({
                                opacity: 1,
                                left: "213px"
                            }).find(".J_subView").eq(n).show();
                        } else {
                            c(n);
                        }
                    }, 200);
                }
            }

            function c(m) {
                var n = function(o) {
                    e.html(o).css({
                        opacity: 1,
                        left: "213px"
                    }).find(".J_subView").eq(m).show();
                    d = true;
                };
                h.cmsContentAjax("lizi_catedata", n);
            }
        },
        fixedObj: {},
        fixed: function(b) {
            var f = this.fixedObj,
                g = b,
                d = g.attr("id") || "fixed_id",
                e = "",
                c = g.height();
            f[d + "_top"] = g.offset().top;
            f[d + "_fun"] = function() {
                var h = $window.scrollTop();
                if (h > f[d + "_top"]) {
                    if (g.hasClass("fixed")) {
                        return;
                    }
                    g.addClass("fixed");
                    if (NALA.check.isIE6) {
                        g.css({
                            position: "absolute"
                        });
                    } else {
                        g.css({
                            position: "fixed"
                        });
                    }
                } else {
                    g.removeClass("fixed");
                    g[0].style.position = "";
                }
            };
            if (NALA.check.isIE6) {
                e = g[0].style.cssText;
                g[0].style.cssText = e + ";_top:expression((document).documentElement.scrollTop);";
            }
            $window.on("scroll", f[d + "_fun"]);
        },
        lazyload: function() {
            var c = $window.height(),
                d = null,
                e = null;
            d = a("img").filter(function() {
                return a(this).attr("original") !== undefined;
            });

            function b() {
                var f = 0;
                if (d.length < 1) {
                    return;
                }
                f = $window.scrollTop();
                d.each(function() {
                    var i = a(this),
                        g = 0,
                        h = i.attr("original");
                    if (h === "") {
                        return;
                    }
                    g = i.offset().top;
                    if (g >= (f - i.height()) && g <= (c + f)) {
                        i.hide().attr("src", h).fadeIn();
                        i.attr("original", "");
                        i.error(function() {
                            this.src = "http://cdn.lizi.com/images/kong.gif";
                            i.addClass("img_error");
                        });
                    }
                });
                d = d.filter(function() {
                    return a(this).attr("original") !== "";
                });
            }
            b();
            $window.on("scroll", function() {
                if (e !== null) {
                    clearTimeout(e);
                }
                e = setTimeout(function() {
                    b();
                }, 50);
            });
        },
        cookie: function(c, k, n) {
            if (typeof k != "undefined") {
                n = n || {};
                if (k === null) {
                    k = "";
                    n.expires = -1;
                }
                var f = "";
                if (n.expires && (typeof n.expires == "number" || n.expires.toUTCString)) {
                    var g;
                    if (typeof n.expires == "number") {
                        g = new Date();
                        g.setTime(g.getTime() + (n.expires * 60 * 60 * 1000));
                    } else {
                        g = n.expires;
                    }
                    f = "; expires=" + g.toUTCString();
                }
                var m = n.path ? "; path=" + n.path : "; path=/";
                var h = n.domain ? "; domain=" + n.domain : "";
                var b = n.secure ? "; secure" : "";
                document.cookie = [c, "=", encodeURIComponent(k), f, m, h, b].join("");
            } else {
                var e = null;
                if (document.cookie && document.cookie != "") {
                    var l = document.cookie.split(";");
                    for (var j = 0; j < l.length; j++) {
                        var d = jQuery.trim(l[j]);
                        if (d.substring(0, c.length + 1) == (c + "=")) {
                            e = decodeURIComponent(d.substring(c.length + 1));
                            break;
                        }
                    }
                }
                return e;
            }
        },
        timeJson: function(c) {
            var b = {};
            b.secs = Math.floor(c % 60);
            b.mins = Math.floor(c / 60 % 60);
            b.hours = Math.floor(c / 60 / 60);
            b.days = 0;
            if (b.hours > 23) {
                b.days = Math.floor(b.hours / 24);
                b.hours = b.hours - b.days * 24;
            }
            if (b.secs < 10) {
                b.secs = "0" + b.secs;
            }
            if (b.mins < 10) {
                b.mins = "0" + b.mins;
            }
            if (b.hours < 10) {
                b.hours = "0" + b.hours;
            }
            if (b.days < 10) {
                b.days = "0" + b.days;
            }
            return b;
        }
    };
    NALA.dialog = {
        close: function(d) {
            var b, c = a.dialog.list;
            if (d) {
                c[d].close();
            } else {
                for (b in c) {
                    c[b].close();
                }
            }
        },
        creat: function(b) {
            var c = null;
            b = a.extend({
                fixed: true,
                title: false,
                lock: true,
                padding: "20px 40px",
                id: "",
                content: ""
            }, b);
            c = a.dialog(b);
            return c;
        },
        success: function(c, d) {
            var b = null;
            d = d || 2;
            this.close();
            c = '<div class="success-tip"><i class="iconfont">&#379;</i>' + c + "</div>";
            b = this.creat({
                id: "success",
                content: c,
                lock: false
            });
            setTimeout(function() {
                var e = a(b.DOM.wrap);
                e.animate({
                    top: "-=50px",
                    opacity: 0
                }, 300, "easeInBack", function() {
                    b.close();
                });
            }, d * 1000);
        },
        warn: function(c, d) {
            var b = null;
            c = '<div class="warn-tip"><i class="iconfont">&#227;</i>' + c + "</div>";
            b = this.creat({
                id: "warn",
                content: c
            });
            b.button({
                name: "知道了",
                focus: true,
                callback: d
            });
        },
        ok: function(c, d) {
            var b = null;
            c = '<div class="ok-tip"><i class="iconfont">&#379;</i>' + c + "</div>";
            b = this.creat({
                id: "ok",
                content: c
            });
            b.button({
                name: "知道了",
                focus: true,
                callback: d
            });
        },
        confirm: function(c, d) {
            var b = null;
            c = '<div class="confirm-tip"><i class="iconfont">&#228;</i>' + c + "</div>";
            b = this.creat({
                id: "confirm",
                content: c
            });
            b.button({
                name: "确定",
                focus: true,
                callback: d
            }, {
                name: "取消"
            });
        },
        showLogin: function(e) {
            var b = null,
                e = e || location.href,
                c = '<div class="dialog_login_box"><div id="login-box"><h2><div class="trig">没有帐号？<a href="/user/reg" target="_blank" class="trigger-box">点击注册</a></div>登录</h2><div class="form-bd"><div class="form_box cle" id="login-nala"><div class="login_box"><form id="login-nala-form"><ul class="form"><li class="text_input"><span class="error_icon"></span><span class="iconfont">&#338;</span><input type="text" name="j_username" class="text" placeholder="用户名/邮箱/手机号"></li><li class="text_input"><span class="error_icon"></span><span class="iconfont">&#247;</span><input type="password" name="j_password" class="text" placeholder="密码"></li><li class="error_box"><em></em></li><li class="login_param"><p><a class="forget_psd" target="_blank" href="/user/resetPwd">忘记密码?</a><label><input type="checkbox" checked="checked" name="_spring_security_remember_me" class="remember-me">下次自动登录</label></p></li><li class="last"><input type="submit" class="btn" value="登 录" /></li></ul></form></div></div></div><ul class="form other-form"><li><h5>使用第三方帐号登录</h5></li><li class="other-login"><a class="sina" target="_blank" href="https://api.weibo.com/oauth2/authorize?client_id=1062800511&response_type=code&redirect_uri=http://www.lizi.com/user/sinaLogin"></a><a class="qq" target="_blank" href="https://graph.qq.com/oauth2.0/authorize?response_type=code&amp;client_id=100224827&amp;state=1&amp;redirect_uri=www.lizi.com/user/qqLoginCallback"></a><a class="alipay" target="_blank" href="http://www.lizi.com/user/alipayLogin"></a><a class="taobao" target="_blank" id="tb-login" href="http://www.lizi.com/user/taobaoLogin"></a><a class="baidu" target="_blank" href="http://www.lizi.com/user/baiduLogin?login=baidu"></a><a class="qihoo360" target="_blank" href="https://openapi.360.cn/oauth2/authorize?client_id=6550d4a07c17ee81e0737a4203d5848c&response_type=code&redirect_uri=http://www.lizi.com/user/qihooCallBack&scope=basic&display=default"></a></li></ul></div></div>';
            if (NALA.isPhone) {
                location.href = "/login/auth";
                return;
            }
            b = a.dialog({
                title: "您尚未登录",
                lock: true,
                fixed: true,
                padding: "0",
                id: "login",
                content: c,
                init: function() {
                    var g = a("#login-nala-form"),
                        k = g.find("input[name=j_username]"),
                        j = g.find("input[name=j_password]"),
                        i = g.find("input[type=submit]"),
                        f = g.find("li.error_box em"),
                        h = g.find("li.text_input");
                    g.find("input").focus(function() {
                        h.removeClass("params_error");
                    });
                    g.submit(function() {
                        var l = a.trim(k.val()),
                            o = a.trim(j.val()),
                            n, m;
                        if (i.hasClass("disabled")) {
                            return false;
                        }
                        if (l == "" || o == "") {
                            n = (l == "") ? "请输入用户名" : "请输入密码";
                            f.text(n).show().delay(2000).fadeOut();
                            return false;
                        }
                        i.addClass("disabled").val("登录中");
                        m = {
                            j_username: l,
                            j_password: o,
                            _spring_security_remember_me: "on"
                        };
                        a.ajax({
                            url: "/j_spring_security_check",
                            type: "post",
                            data: m,
                            dataType: "json",
                            success: function(p) {
                                if (p.status == 1) {
                                    location.href = e;
                                } else {
                                    if (p.status == 0) {
                                        i.removeClass("disabled").val("登 录");
                                        f.text("您输入的密码和用户名不匹配").show().delay(2000).fadeOut();
                                        h.addClass("params_error");
                                    }
                                }
                            },
                            error: function(p) {
                                if (p.status == 200) {
                                    location.reload();
                                } else {
                                    i.removeClass("disabled").val("登 录");
                                    NALA.dialog.warn("服务器忙，请稍后再试。(" + p.status + ")");
                                }
                            }
                        });
                        return false;
                    });
                    a.ajax({
                        url: "/user/ajaxUnionLoginFilter"
                    });
                }
            });
            var d = '<div style="width:360px; text-indent: 2em; font-size: 14px; margin-bottom: 10px;">因淘宝联合登录故障，新用户请选择其他方式登录，老会员请联系客服取回您的淘宝联合登录账号。对您造成的不便，丽子表示抱歉。</div><p style="text-align: center;"><a href="http://wpa.b.qq.com/cgi/wpa.php?ln=1&key=XzgwMDA0MjIzN181OTY5N184MDAwNDIyMzdfMl8" class="graybtn" target="_blank"><i class="iconfont" style="color:#f70; font-size:14px;">&#54;</i> 点此咨询客服</a></p>';
            a("#tb-login").on("click", function() {
                NALA.dialog.creat({
                    id: "tblogin-error",
                    title: "登录故障",
                    content: d
                });
                return false;
            });
        }
    };
})(jQuery);
$(function() {
    var a = NALA.common;
    a.showLoginInfo();
    a.head_cart_event();
    a.mainNav_animate();
    a.searchBar();
    a.lazyload();
    a.toolBar();
});