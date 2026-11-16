// Adapted from xscanzm/magic-tree-qr; see LICENSE and PROVENANCE.md.
import * as m from "react";
import Y from "qrcode";
var $ = 0.0245;
var q = $;
var G = 67240;
var W = 0.46;
var Z = {
  r: 0.9,
  g: 0.85,
  b: 0.95
};
var Q = {
  r: 0.55,
  g: 0.6,
  b: 0.5
};
var K = "https://example.com/";
function J(_0x8f69b8) {
  return "vec3f(" + _0x8f69b8.r.toFixed(6) + ", " + _0x8f69b8.g.toFixed(6) + ", " + _0x8f69b8.b.toFixed(6) + ")";
}
function ee(_0x207145) {
  try {
    const {
      modules: _0x441361
    } = Y.create(_0x207145 || "https://example.com/", {
      errorCorrectionLevel: "M"
    });
    const {
      size: _0x4fe257
    } = _0x441361;
    const _0x5a0fde = [];
    for (let _0x470d50 = 0; _0x470d50 < _0x4fe257; _0x470d50++) {
      const _0x1ae87b = [];
      for (let _0x4b15a7 = 0; _0x4b15a7 < _0x4fe257; _0x4b15a7++) {
        _0x1ae87b.push(_0x441361.get(_0x4b15a7, _0x470d50) === 1);
      }
      _0x5a0fde.push(_0x1ae87b);
    }
    return _0x5a0fde;
  } catch {
    throw new Error("QR content cannot be encoded");
  }
}
var te = function (_0x493478) {
  _0x493478[_0x493478.Dirt = 0] = "Dirt";
  _0x493478[_0x493478.CherryBlossom = 1] = "CherryBlossom";
  _0x493478[_0x493478.Trunk = 2] = "Trunk";
  _0x493478[_0x493478.Grass = 3] = "Grass";
  _0x493478[_0x493478.FallenPetals = 4] = "FallenPetals";
  _0x493478[_0x493478.Branch = 5] = "Branch";
  return _0x493478;
}({});
function ne(_0x279ed6, _0x487f15 = 0, _0x1e5f0f = 0) {
  const _0x3b15f5 = Math.sin(_0x279ed6 * 127.1 + _0x487f15 * 311.7 + _0x1e5f0f * 43.7) * 43758.5;
  return _0x3b15f5 - Math.floor(_0x3b15f5);
}
var re = 0;
function oe(_0x5c068b) {
  re = _0x5c068b;
}
function le(_0x36209e, _0x505581 = 0, _0x3aa8b2 = 0) {
  const _0x5c362f = Math.sin(_0x36209e * 127.1 + _0x505581 * 311.7 + _0x3aa8b2 * 43.7 + re * 7919) * 43758.5;
  return _0x5c362f - Math.floor(_0x5c362f);
}
function ae(_0x229433) {
  const _0xe8133 = _0x229433.length;
  const _0x4fd4c0 = _0xe8133 / 2;
  const _0x25b220 = _0xe8133 / 2;
  const _0x2b21fe = _0xe8133 / 29;
  const _0x30dc8a = Math.round(_0x2b21fe * 12);
  const _0x4b7910 = _0x30dc8a * q;
  const _0x19b5ff = _0xe8133 * W;
  const _0x561d0e = _0x19b5ff * _0x19b5ff;
  const _0x5f5cb4 = new Float32Array(268960);
  const _0xf9b88c = new Float32Array(G);
  const _0x274541 = new Float32Array(G);
  const _0x349655 = new Uint32Array(G);
  let _0x5944f2 = 0;
  const _0xfbd8fb = Math.round(_0x2b21fe * 18);
  for (let _0x55becd = 0; _0x55becd < _0xe8133; _0x55becd++) {
    const _0x69a4b7 = _0x229433[_0x55becd];
    for (let _0x5da55c = 0; _0x5da55c < _0xe8133; _0x5da55c++) {
      const _0x16fe1b = _0x69a4b7[_0x5da55c];
      const _0x4a81af = _0x5da55c - _0x4fd4c0;
      const _0x169607 = _0x55becd - _0x25b220;
      const _0x3a1e1 = _0x4a81af * _0x4a81af + _0x169607 * _0x169607;
      const _0x4fe3c8 = _0x5944f2;
      const _0x1a4644 = _0x4fe3c8 * 4;
      _0x5f5cb4[_0x1a4644] = _0x5da55c;
      _0x5f5cb4[_0x1a4644 + 1] = _0x55becd;
      _0x5f5cb4[_0x1a4644 + 2] = 0;
      _0x5f5cb4[_0x1a4644 + 3] = 0;
      _0xf9b88c[_0x4fe3c8] = q;
      _0x274541[_0x4fe3c8] = 0;
      _0x349655[_0x4fe3c8] = _0x16fe1b ? _0x3a1e1 < 6.25 ? te.CherryBlossom : _0x3a1e1 >= _0x561d0e ? te.Grass : te.FallenPetals : te.Dirt;
      _0x5944f2++;
      if (_0x16fe1b) {
        if (_0x3a1e1 < 6.25) {
          for (let _0xa0b325 = 1; _0xa0b325 < _0x30dc8a; _0xa0b325++) {
            const _0x3650da = _0x5944f2;
            const _0x5bde27 = _0x3650da * 4;
            _0x5f5cb4[_0x5bde27] = _0x5da55c;
            _0x5f5cb4[_0x5bde27 + 1] = _0x55becd;
            _0x5f5cb4[_0x5bde27 + 2] = 0;
            _0x5f5cb4[_0x5bde27 + 3] = 0;
            _0xf9b88c[_0x3650da] = q;
            _0x274541[_0x3650da] = _0xa0b325 * q;
            _0x349655[_0x3650da] = te.Trunk;
            _0x5944f2++;
          }
        }
        if (_0x3a1e1 < _0x561d0e) {
          const _0x2ac119 = 1 - Math.sqrt(_0x3a1e1) / _0x19b5ff;
          const _0xf6efc3 = Math.max(4, Math.round(_0xfbd8fb * (0.25 + _0x2ac119 * 0.75 * _0x2ac119)));
          const _0x540cf1 = Math.floor(_0x2ac119 * 4.5 * _0x2b21fe) * q;
          for (let _0x27bdbb = 0; _0x27bdbb < _0xf6efc3; _0x27bdbb++) {
            const _0xb811f0 = _0x5944f2;
            const _0x4e29bb = _0xb811f0 * 4;
            _0x5f5cb4[_0x4e29bb] = _0x5da55c;
            _0x5f5cb4[_0x4e29bb + 1] = _0x55becd;
            _0x5f5cb4[_0x4e29bb + 2] = 0;
            _0x5f5cb4[_0x4e29bb + 3] = 0;
            _0xf9b88c[_0xb811f0] = q;
            _0x274541[_0xb811f0] = _0x4b7910 + _0x27bdbb * q + _0x540cf1;
            _0x349655[_0xb811f0] = te.CherryBlossom;
            _0x5944f2++;
          }
          const _0x5deec3 = Math.floor(ne(_0x5da55c, _0x55becd, 500) * 6 * _0x2b21fe);
          for (let _0x5d115b = 0; _0x5d115b < _0x5deec3; _0x5d115b++) {
            const _0x87360b = _0x5944f2;
            const _0x58ce22 = _0x87360b * 4;
            _0x5f5cb4[_0x58ce22] = _0x5da55c;
            _0x5f5cb4[_0x58ce22 + 1] = _0x55becd;
            _0x5f5cb4[_0x58ce22 + 2] = 0;
            _0x5f5cb4[_0x58ce22 + 3] = 0;
            _0xf9b88c[_0x87360b] = q;
            _0x274541[_0x87360b] = _0x4b7910 + (_0xf6efc3 + _0x5d115b) * q + _0x540cf1;
            _0x349655[_0x87360b] = te.CherryBlossom;
            _0x5944f2++;
          }
          if (_0x3a1e1 < 2.25) {
            for (let _0x460077 = 0; _0x460077 < 4; _0x460077++) {
              const _0x19d474 = _0x5944f2;
              const _0x545e67 = _0x19d474 * 4;
              _0x5f5cb4[_0x545e67] = _0x5da55c;
              _0x5f5cb4[_0x545e67 + 1] = _0x55becd;
              _0x5f5cb4[_0x545e67 + 2] = 0;
              _0x5f5cb4[_0x545e67 + 3] = 0;
              _0xf9b88c[_0x19d474] = q;
              _0x274541[_0x19d474] = _0x4b7910 + _0x460077 * q;
              _0x349655[_0x19d474] = te.CherryBlossom;
              _0x5944f2++;
            }
          }
        }
      }
    }
  }
  return {
    positions: _0x5f5cb4,
    heights: _0xf9b88c,
    baseY: _0x274541,
    types: _0x349655,
    gridSize: _0xe8133,
    numBlocks: _0x5944f2
  };
}
function ie(_0x427824) {
  const _0x9d63f2 = _0x427824.length;
  let _0x211dd5 = 0;
  let _0x1d18f3 = 0;
  for (let _0x3fec09 = 0; _0x3fec09 < _0x9d63f2; _0x3fec09++) {
    for (let _0x316c37 = 0; _0x316c37 < _0x9d63f2; _0x316c37++) {
      if (_0x427824[_0x3fec09][_0x316c37]) {
        _0x211dd5++;
      }
      if (_0x316c37 > 0 && _0x427824[_0x3fec09][_0x316c37] !== _0x427824[_0x3fec09][_0x316c37 - 1]) {
        _0x1d18f3++;
      }
      if (_0x3fec09 > 0 && _0x427824[_0x3fec09][_0x316c37] !== _0x427824[_0x3fec09 - 1][_0x316c37]) {
        _0x1d18f3++;
      }
    }
  }
  const _0x38fd42 = _0x211dd5 / (_0x9d63f2 * _0x9d63f2);
  const _0x3d3828 = _0x1d18f3 / (_0x9d63f2 * 2 * (_0x9d63f2 - 1));
  const _0x39f8ba = _0x9d63f2 / 29;
  return {
    gridSize: _0x9d63f2,
    density: _0x38fd42,
    edgeRatio: _0x3d3828,
    trunkHeight: (0.26 + _0x38fd42 * 0.08) * _0x39f8ba,
    trunkRadius: (0.024 + _0x38fd42 * 0.008) * _0x39f8ba,
    trunkLean: (0.04 + ne(_0x38fd42, _0x3d3828) * 0.03) * _0x39f8ba,
    mainBranches: 4 + Math.floor(_0x38fd42 * 4),
    branchSpread: 0.5 + _0x3d3828 * 0.5,
    branchLengthScale: 0.55 + _0x38fd42 * 0.25,
    maxDepth: _0x3d3828 > 0.28 ? 5 : 4,
    canopyDensity: 0.5 + _0x38fd42 * 0.5
  };
}
function se(_0x20ed88, _0x502ef9) {
  const _0x4bffad = _0x502ef9 * W * $;
  const _0x1503b3 = [];
  const _0x213242 = [];
  const {
    trunkHeight: _0x1c95cd,
    trunkRadius: _0x16e7f2,
    trunkLean: _0x41e54e,
    mainBranches: _0x53f698,
    branchLengthScale: _0x775357,
    maxDepth: _0x27b343
  } = _0x20ed88;
  let _0x2c60d5 = 0;
  function _0x22daca(_0x2b1124, _0x5eaaa6, _0x46283b, _0x49488c, _0x4d411b, _0x22c197, _0x449652, _0x4ef4ca, _0x1afc5b, _0x1ed9ea) {
    _0x1503b3.push(_0x2b1124, _0x5eaaa6, _0x46283b, _0x49488c, _0x4d411b, _0x22c197, _0x449652, _0x4ef4ca, _0x1afc5b, _0x1ed9ea, 0, 0);
    _0x2c60d5++;
  }
  for (let _0x32ef82 = 0; _0x32ef82 < 10; _0x32ef82++) {
    const _0x199ef7 = _0x32ef82 / 10;
    const _0x1be1fb = (_0x32ef82 + 1) / 10;
    const _0x3d67d5 = _0x16e7f2 * (1 - _0x199ef7 * 0.55) * (1 + Math.sin(_0x199ef7 * Math.PI * 0.8) * 0.08);
    const _0x341807 = _0x16e7f2 * (1 - _0x1be1fb * 0.55) * (1 + Math.sin(_0x1be1fb * Math.PI * 0.8) * 0.08);
    const _0x3fc8bc = _0x41e54e * _0x199ef7 * _0x199ef7 + _0x41e54e * 0.3 * Math.sin(_0x199ef7 * Math.PI * 1.5);
    const _0x5025a5 = _0x41e54e * 0.5 * Math.sin(_0x199ef7 * Math.PI * 0.8);
    const _0x5ef742 = _0x41e54e * _0x1be1fb * _0x1be1fb + _0x41e54e * 0.3 * Math.sin(_0x1be1fb * Math.PI * 1.5);
    const _0x27c5f7 = _0x41e54e * 0.5 * Math.sin(_0x1be1fb * Math.PI * 0.8);
    _0x22daca(_0x3fc8bc, _0x199ef7 * _0x1c95cd, _0x5025a5, _0x3d67d5, _0x5ef742, _0x1be1fb * _0x1c95cd, _0x27c5f7, _0x341807, 0, _0x199ef7 * 0.5);
  }
  function _0x40061e(_0x537471) {
    return {
      x: _0x41e54e * _0x537471 * _0x537471 + _0x41e54e * 0.3 * Math.sin(_0x537471 * Math.PI * 1.5),
      y: _0x1c95cd * _0x537471,
      z: _0x41e54e * 0.5 * Math.sin(_0x537471 * Math.PI * 0.8)
    };
  }
  const _0x44030b = _0x1c95cd + _0x4bffad * 1.5;
  const _0x26697a = _0x1c95cd * 0.5;
  function _0x414b54(_0x206c34, _0x2b782c, _0x3f6d33, _0x4353c0, _0x10032f, _0x539494, _0x436fa6, _0x2cee5c, _0x26c3c9, _0x61ba34) {
    if (_0x2c60d5 >= 485) {
      return;
    }
    _0x22daca(_0x206c34, _0x2b782c, _0x3f6d33, _0x4353c0, _0x10032f, _0x539494, _0x436fa6, _0x2cee5c, _0x61ba34, le(_0x2c60d5, 0, 400));
    const _0x554a3c = 1 + Math.floor(le(_0x2c60d5, 0, 500) * 2);
    for (let _0x441bd5 = 0; _0x441bd5 < _0x554a3c && _0x2c60d5 < 485; _0x441bd5++) {
      const _0x1b5e3a = _0x26c3c9 + (le(_0x2c60d5, _0x441bd5, 600) - 0.5) * 2.2;
      const _0x285119 = _0x4bffad * (0.15 + le(_0x2c60d5, _0x441bd5, 700) * 0.2) * _0x775357;
      const _0x53e98e = 0.1 + le(_0x2c60d5, _0x441bd5, 750) * 0.45;
      const _0xab784 = _0x2cee5c * (0.5 + le(_0x2c60d5, _0x441bd5, 800) * 0.2);
      let _0xceeb6a = _0x10032f + Math.cos(_0x1b5e3a) * Math.cos(_0x53e98e) * _0x285119;
      let _0x450bc3 = Math.max(Math.min(_0x539494 + Math.sin(_0x53e98e) * _0x285119, _0x44030b), _0x26697a);
      let _0x4cd2c2 = _0x436fa6 + Math.sin(_0x1b5e3a) * Math.cos(_0x53e98e) * _0x285119;
      const _0x539cd0 = _0xab784 * 0.4;
      const _0x10b53b = Math.sqrt(_0xceeb6a * _0xceeb6a + _0x4cd2c2 * _0x4cd2c2);
      if (_0x10b53b > _0x4bffad * 0.95) {
        _0xceeb6a *= _0x4bffad * 0.95 / _0x10b53b;
        _0x4cd2c2 *= _0x4bffad * 0.95 / _0x10b53b;
      }
      _0x22daca(_0x10032f, _0x539494, _0x436fa6, _0xab784, _0xceeb6a, _0x450bc3, _0x4cd2c2, _0x539cd0, _0x61ba34 + 1, le(_0x2c60d5, _0x441bd5, 850));
      _0x213242.push({
        x: _0xceeb6a,
        y: _0x450bc3,
        z: _0x4cd2c2,
        radius: _0x539cd0 * 25
      });
      if (_0x27b343 >= 4 && _0x2c60d5 < 485) {
        const _0x412cee = _0x1b5e3a + (le(_0x2c60d5, _0x441bd5, 860) - 0.5) * 2.2;
        const _0x562a38 = _0x285119 * 0.45;
        const _0x4b94dc = 0.1 + le(_0x2c60d5, _0x441bd5, 870) * 0.35;
        const _0x5e8b0f = _0x539cd0 * 0.5;
        let _0x4f01b4 = _0xceeb6a + Math.cos(_0x412cee) * Math.cos(_0x4b94dc) * _0x562a38;
        const _0x46cb67 = Math.max(Math.min(_0x450bc3 + Math.sin(_0x4b94dc) * _0x562a38, _0x44030b), _0x26697a);
        let _0x201e61 = _0x4cd2c2 + Math.sin(_0x412cee) * Math.cos(_0x4b94dc) * _0x562a38;
        const _0x1097b4 = Math.sqrt(_0x4f01b4 * _0x4f01b4 + _0x201e61 * _0x201e61);
        if (_0x1097b4 > _0x4bffad * 0.95) {
          _0x4f01b4 *= _0x4bffad * 0.95 / _0x1097b4;
          _0x201e61 *= _0x4bffad * 0.95 / _0x1097b4;
        }
        _0x22daca(_0xceeb6a, _0x450bc3, _0x4cd2c2, _0x539cd0, _0x4f01b4, _0x46cb67, _0x201e61, _0x5e8b0f * 0.3, _0x61ba34 + 2, le(_0x2c60d5, _0x441bd5, 880));
        _0x213242.push({
          x: _0x4f01b4,
          y: _0x46cb67,
          z: _0x201e61,
          radius: _0x5e8b0f * 15
        });
      }
    }
  }
  const _0x5ebc65 = 3 + Math.floor(le(0, 0, 2000) * 2);
  const _0xd5c3ff = _0x40061e(0.95);
  for (let _0x3b3ce0 = 0; _0x3b3ce0 < _0x5ebc65 && _0x2c60d5 < 470; _0x3b3ce0++) {
    const _0x2c157b = _0x3b3ce0 / _0x5ebc65 * Math.PI * 2 + le(_0x3b3ce0, 0, 2100) * 0.5;
    const _0x1e5157 = _0x4bffad * (0.1 + le(_0x3b3ce0, 0, 2200) * 0.25);
    const _0x15d972 = _0x16e7f2 * (0.3 + le(_0x3b3ce0, 0, 2300) * 0.12);
    const _0x13c1ba = 2 + Math.floor(le(_0x3b3ce0, 0, 2400));
    let _0x267545 = _0xd5c3ff.x;
    let _0x157db9 = _0xd5c3ff.y;
    let _0x514a91 = _0xd5c3ff.z;
    let _0x4a4c09 = _0x15d972;
    for (let _0x4796f1 = 0; _0x4796f1 < _0x13c1ba && _0x2c60d5 < 475; _0x4796f1++) {
      const _0x5c2f8d = (_0x4796f1 + 1) / _0x13c1ba;
      const _0x473603 = (le(_0x3b3ce0, _0x4796f1, 2500) - 0.5) * 0.01;
      const _0x1096b1 = (le(_0x3b3ce0, _0x4796f1, 2600) - 0.5) * 0.01;
      const _0x12999f = _0xd5c3ff.x + Math.cos(_0x2c157b) * _0x1e5157 * _0x5c2f8d + _0x473603;
      const _0x2d108c = _0xd5c3ff.y + (_0x44030b - _0xd5c3ff.y) * _0x5c2f8d * (0.7 + le(_0x3b3ce0, _0x4796f1, 2700) * 0.3);
      const _0x23fb48 = _0xd5c3ff.z + Math.sin(_0x2c157b) * _0x1e5157 * _0x5c2f8d + _0x1096b1;
      const _0x5d4efa = _0x4a4c09 * (0.5 + le(_0x3b3ce0, _0x4796f1, 2800) * 0.1);
      _0x22daca(_0x267545, _0x157db9, _0x514a91, _0x4a4c09, _0x12999f, _0x2d108c, _0x23fb48, _0x5d4efa, 1, le(_0x3b3ce0, _0x4796f1, 2900));
      _0x267545 = _0x12999f;
      _0x157db9 = _0x2d108c;
      _0x514a91 = _0x23fb48;
      _0x4a4c09 = _0x5d4efa;
    }
    _0x213242.push({
      x: _0x267545,
      y: _0x157db9,
      z: _0x514a91,
      radius: _0x4a4c09 * 35
    });
    _0x414b54(_0x267545, _0x157db9, _0x514a91, _0x4a4c09 * 0.7, _0x267545 + (le(_0x3b3ce0, 0, 3000) - 0.5) * _0x4bffad * 0.35, Math.max(Math.min(_0x157db9 + _0x4bffad * 0.08, _0x44030b), _0x26697a), _0x514a91 + (le(_0x3b3ce0, 0, 3100) - 0.5) * _0x4bffad * 0.35, _0x4a4c09 * 0.3, _0x2c157b, 2);
  }
  for (let _0x113cc4 = 0; _0x113cc4 < _0x53f698 && _0x2c60d5 < 470; _0x113cc4++) {
    const _0x35ba82 = _0x40061e(0.7 + le(_0x113cc4, 0, 1200) * 0.25);
    const _0x2e8134 = _0x113cc4 / _0x53f698 * Math.PI * 2 + (le(_0x113cc4, 0, 900) - 0.5) * 0.4;
    const _0xf33809 = _0x4bffad * (0.6 + le(_0x113cc4, 0, 1000) * 0.35);
    const _0xab260d = _0x1c95cd * (0.8 + le(_0x113cc4, 0, 1050) * 0.2);
    const _0x5348a2 = Math.cos(_0x2e8134) * _0xf33809;
    const _0x59bdbf = Math.sin(_0x2e8134) * _0xf33809;
    let _0x16df8d = _0x35ba82.x;
    let _0x50bf63 = _0x35ba82.y;
    let _0x1c1dca = _0x35ba82.z;
    let _0x225f0f = _0x16e7f2 * (0.4 + le(_0x113cc4, 0, 1100) * 0.15);
    for (let _0x5482d7 = 0; _0x5482d7 < 3 && _0x2c60d5 < 475; _0x5482d7++) {
      const _0x37aae9 = (_0x5482d7 + 1) / 3;
      const _0x29e1c9 = Math.sin(_0x37aae9 * Math.PI) * _0x4bffad * 0.3;
      const _0x5d0d43 = (le(_0x113cc4, _0x5482d7, 150) - 0.5) * 0.015;
      const _0x46bbb5 = (le(_0x113cc4, _0x5482d7, 250) - 0.5) * 0.015;
      const _0x5487d3 = _0x35ba82.x + (_0x5348a2 - _0x35ba82.x) * _0x37aae9 + _0x5d0d43;
      const _0x530e73 = _0x35ba82.y + (_0xab260d - _0x35ba82.y) * _0x37aae9 + _0x29e1c9 * (1 - _0x37aae9);
      const _0x18bf77 = _0x35ba82.z + (_0x59bdbf - _0x35ba82.z) * _0x37aae9 + _0x46bbb5;
      const _0x3901b7 = _0x225f0f * (0.55 + le(_0x113cc4, _0x5482d7, 350) * 0.1);
      _0x22daca(_0x16df8d, _0x50bf63, _0x1c1dca, _0x225f0f, _0x5487d3, _0x530e73, _0x18bf77, _0x3901b7, 1, le(_0x113cc4, _0x5482d7, 400));
      if (_0x5482d7 >= 1 && _0x2c60d5 < 470) {
        _0x414b54(_0x5487d3, _0x530e73, _0x18bf77, _0x3901b7 * 0.6, _0x5487d3 + (le(_0x113cc4, _0x5482d7, 610) - 0.5) * _0x4bffad * 0.45, Math.max(Math.min(_0x530e73 + _0x4bffad * (0.05 + le(_0x113cc4, _0x5482d7, 620) * 0.1), _0x44030b), _0x26697a), _0x18bf77 + (le(_0x113cc4, _0x5482d7, 630) - 0.5) * _0x4bffad * 0.45, _0x3901b7 * 0.25, _0x2e8134, 2);
      }
      _0x16df8d = _0x5487d3;
      _0x50bf63 = _0x530e73;
      _0x1c1dca = _0x18bf77;
      _0x225f0f = _0x3901b7;
    }
    _0x213242.push({
      x: _0x16df8d,
      y: _0x50bf63,
      z: _0x1c1dca,
      radius: _0x225f0f * 30
    });
  }
  return {
    segments: new Float32Array(_0x1503b3),
    segmentCount: _0x2c60d5,
    tips: _0x213242
  };
}
function ue(_0x3a8805, _0x530fdd) {
  const _0x2fcf19 = _0x530fdd.gridSize;
  const _0x44143a = _0x2fcf19 * $ * 0.5;
  const _0x34a707 = [];
  let _0x9010d = 0;
  const _0x381388 = 100000;
  function _0x491b2f(_0x1d0d89, _0x323eee) {
    return {
      col: (_0x1d0d89 + _0x44143a) / $,
      row: (_0x323eee + _0x44143a) / $
    };
  }
  function _0x3d5134(_0x1624bd, _0x36482c, _0x3718f4, _0x708a2) {
    if (!(_0x9010d >= _0x381388)) {
      _0x34a707.push(_0x1624bd, _0x36482c, _0x3718f4, _0x708a2);
      _0x9010d++;
    }
  }
  for (let _0xe98428 = 0; _0xe98428 < _0x3a8805.length; _0xe98428++) {
    const _0x4f0012 = _0x3a8805[_0xe98428];
    if (le(_0xe98428, 0, 780) < 0.01) {
      continue;
    }
    const _0x3299c9 = Math.sqrt(_0x4f0012.x * _0x4f0012.x + _0x4f0012.z * _0x4f0012.z);
    const _0x2bbbe7 = 1 + (1 - Math.min(1, _0x3299c9 / (_0x44143a * W))) * 0.45;
    const _0x11cdd4 = (1 + le(_0xe98428, 3, 790) * 0.3) * _0x2bbbe7;
    const _0x75f64a = Math.max(40, Math.floor(_0x4f0012.radius * 60 * _0x530fdd.canopyDensity * _0x11cdd4));
    const _0x5ce8f7 = _0x4f0012.radius * $ * 9 * _0x11cdd4;
    for (let _0x3f40f0 = 0; _0x3f40f0 < _0x75f64a; _0x3f40f0++) {
      const _0x14a522 = le(_0xe98428, _0x3f40f0, 800);
      const _0x5e2b6 = le(_0xe98428, _0x3f40f0, 810) * Math.PI * 2;
      const _0x132c91 = le(_0xe98428, _0x3f40f0, 820) * 2 - 1;
      const _0xb45b2a = Math.sqrt(1 - _0x132c91 * _0x132c91);
      const _0x51c242 = _0x5ce8f7 * Math.cbrt(le(_0xe98428, _0x3f40f0, 830));
      const _0x859f01 = _0x4f0012.x + _0x51c242 * _0xb45b2a * Math.cos(_0x5e2b6) * 1.5;
      const _0x5a59b4 = _0x4f0012.y + _0x51c242 * _0x132c91 * 1.1 + _0x5ce8f7 * 0.1;
      const _0x1b0006 = _0x491b2f(_0x859f01, _0x4f0012.z + _0x51c242 * _0xb45b2a * Math.sin(_0x5e2b6) * 1.5);
      _0x3d5134(_0x1b0006.col, _0x1b0006.row, _0x5a59b4, _0x14a522);
    }
    const _0x59794d = 6 + Math.floor(le(_0xe98428, 0, 1500) * 6);
    for (let _0x403ced = 0; _0x403ced < _0x59794d; _0x403ced++) {
      const _0x3d0c95 = le(_0xe98428, _0x403ced, 1600);
      const _0x35e4a5 = le(_0xe98428, _0x403ced, 1700) * Math.PI * 2;
      const _0x4af583 = _0x5ce8f7 * 0.5;
      const _0xc0b4e6 = _0x4f0012.x + Math.cos(_0x35e4a5) * _0x4af583;
      const _0x529457 = _0x4f0012.z + Math.sin(_0x35e4a5) * _0x4af583;
      const _0x93815b = _0x4f0012.y - q * (0.5 + le(_0xe98428, _0x403ced, 1900) * 2);
      const _0x450fc7 = _0x491b2f(_0xc0b4e6, _0x529457);
      _0x3d5134(_0x450fc7.col, _0x450fc7.row, _0x93815b, _0x3d0c95);
    }
    if (le(_0xe98428, 2, 900) < 0.5) {
      const _0x2ec00 = le(_0xe98428, 0, 910) + 1;
      const _0x2f08b0 = le(_0xe98428, 0, 920) * Math.PI * 2;
      const _0x1074eb = _0x4f0012.x + Math.cos(_0x2f08b0) * _0x5ce8f7 * 0.4;
      const _0x2e4d81 = _0x4f0012.z + Math.sin(_0x2f08b0) * _0x5ce8f7 * 0.4;
      const _0x3ff7df = _0x4f0012.y - 0.01225;
      const _0x4a0022 = _0x491b2f(_0x1074eb, _0x2e4d81);
      _0x3d5134(_0x4a0022.col, _0x4a0022.row, _0x3ff7df, _0x2ec00);
    }
  }
  if (_0x3a8805.length > 0 && _0x9010d < _0x381388) {
    let _0x10f730 = -Infinity;
    for (let _0x590352 = 0; _0x590352 < _0x3a8805.length; _0x590352++) {
      if (_0x3a8805[_0x590352].y > _0x10f730) {
        _0x10f730 = _0x3a8805[_0x590352].y;
      }
    }
    const _0x434b01 = Math.floor(Math.max(0.75, _0x530fdd.canopyDensity) * 120);
    const _0x3bdf00 = _0x44143a * W * 0.2;
    const _0x211c62 = _0x10f730 - 0.049;
    for (let _0xd712e = 0; _0xd712e < _0x434b01; _0xd712e++) {
      const _0x594041 = le(_0xd712e, 0, 5100) * Math.PI * 2;
      const _0x2439a1 = _0x3bdf00 * Math.sqrt(le(_0xd712e, 0, 5200));
      const _0xd54fc3 = Math.cos(_0x594041) * _0x2439a1;
      const _0x3bb07e = Math.sin(_0x594041) * _0x2439a1;
      const _0x244438 = _0x211c62 + (le(_0xd712e, 0, 5300) - 0.35) * q * 8;
      const _0x3d3272 = le(_0xd712e, 0, 5400);
      const _0x11ee78 = _0x491b2f(_0xd54fc3, _0x3bb07e);
      _0x3d5134(_0x11ee78.col, _0x11ee78.row, _0x244438, _0x3d3272);
    }
  }
  const _0x45a7e6 = _0x2fcf19 * W * $;
  for (let _0x397dc0 = 0; _0x397dc0 < 80; _0x397dc0++) {
    const _0x196a9c = le(_0x397dc0, 0, 4000) * Math.PI * 2;
    const _0x3ee931 = le(_0x397dc0, 0, 4100);
    const _0x4e7b3e = _0x45a7e6 * (0.1 + _0x3ee931 * _0x3ee931 * 0.75);
    const _0x2303f7 = Math.cos(_0x196a9c) * _0x4e7b3e;
    const _0x5a52f1 = Math.sin(_0x196a9c) * _0x4e7b3e;
    const _0x50f155 = le(_0x397dc0, 0, 4200);
    const _0x5455f1 = _0x491b2f(_0x2303f7, _0x5a52f1);
    _0x3d5134(_0x5455f1.col, _0x5455f1.row, 0.0294, _0x50f155);
  }
  const _0x1aa98b = new Float32Array(400000);
  _0x1aa98b.set(new Float32Array(_0x34a707));
  return {
    positions: _0x1aa98b,
    count: _0x9010d
  };
}
function ce(_0x529473) {
  const _0x158edb = _0x529473.length;
  const _0x496094 = _0x158edb / 2;
  const _0x4e288c = _0x158edb / 2;
  const _0x44267a = _0x158edb / 29;
  const _0x5c79d6 = Math.round(_0x44267a * 12) * q;
  const _0x46b675 = _0x158edb * W;
  const _0x3781ba = [];
  let _0x313c0f = 0;
  const _0x3fa930 = _0x46b675 * _0x46b675;
  for (let _0x528309 = 0; _0x528309 < _0x158edb; _0x528309++) {
    for (let _0x1ff797 = 0; _0x1ff797 < _0x158edb; _0x1ff797++) {
      const _0x31b9f9 = _0x1ff797 - _0x496094;
      const _0x492658 = _0x528309 - _0x4e288c;
      const _0x533ac0 = _0x31b9f9 * _0x31b9f9 + _0x492658 * _0x492658;
      if (_0x533ac0 < _0x3fa930 && _0x533ac0 >= 6.25) {
        const _0x579646 = 1 - Math.sqrt(_0x533ac0) / _0x46b675;
        const _0x4b0dab = Math.round(_0x44267a * 18);
        const _0xabfc6d = Math.max(4, Math.round(_0x4b0dab * (0.25 + _0x579646 * 0.75 * _0x579646))) + Math.floor(ne(_0x1ff797, _0x528309, 500) * 6 * _0x44267a);
        const _0x2c5886 = Math.floor(_0x579646 * 4.5 * _0x44267a) * q;
        const _0xf16cc7 = _0x5c79d6 + (_0xabfc6d - 1) * q + _0x2c5886 + q;
        const _0x2c5f55 = 4 + Math.floor(ne(_0x1ff797, _0x528309, 600) * 3);
        for (let _0x5e25dc = 0; _0x5e25dc < _0x2c5f55; _0x5e25dc++) {
          const _0x4425b5 = ne(_0x1ff797, _0x528309, 777 + _0x5e25dc);
          const _0x1607e3 = (ne(_0x1ff797, _0x528309, 800 + _0x5e25dc) - 0.5) * 1.2;
          const _0x13aa55 = (ne(_0x1ff797, _0x528309, 900 + _0x5e25dc) - 0.5) * 1.2;
          const _0x1e7c27 = (ne(_0x1ff797, _0x528309, 1000 + _0x5e25dc) - 0.6) * q * 2;
          _0x3781ba.push(_0x1ff797 + _0x1607e3, _0x528309 + _0x13aa55, _0xf16cc7 + _0x1e7c27, _0x4425b5);
          _0x313c0f++;
        }
        if (ne(_0x1ff797, _0x528309, 1100) < 0.35) {
          const _0x2970f8 = ne(_0x1ff797, _0x528309, 1200) + 1;
          const _0x2ee6bc = (ne(_0x1ff797, _0x528309, 1300) - 0.5) * 0.5;
          const _0x586b16 = (ne(_0x1ff797, _0x528309, 1400) - 0.5) * 0.5;
          _0x3781ba.push(_0x1ff797 + _0x2ee6bc, _0x528309 + _0x586b16, _0xf16cc7 - 0.0245, _0x2970f8);
          _0x313c0f++;
        }
      }
    }
  }
  return {
    positions: _0x3781ba,
    count: _0x313c0f
  };
}
function fe(_0x20367e, _0x1d3800) {
  const _0x462aab = [];
  let _0x324d25 = 0;
  const _0x47c257 = _0x20367e / 2;
  const _0x2e15e5 = _0x20367e / 2;
  const _0xaa6940 = _0x20367e * W;
  const _0x4e77ff = _0xaa6940 * _0xaa6940;
  for (let _0x4fc3f0 = 0; _0x4fc3f0 < _0x20367e; _0x4fc3f0++) {
    for (let _0x444372 = 0; _0x444372 < _0x20367e && _0x324d25 < 50000; _0x444372++) {
      const _0xdb17ed = _0x444372 - _0x47c257;
      const _0x356079 = _0x4fc3f0 - _0x2e15e5;
      const _0x363a6d = _0xdb17ed * _0xdb17ed + _0x356079 * _0x356079;
      if (_0x363a6d < 25) {
        continue;
      }
      if (!_0x1d3800?.[_0x4fc3f0]?.[_0x444372]) {
        continue;
      }
      if (_0x363a6d < _0x4e77ff) {
        continue;
      }
      const _0x397f3e = 14 + Math.floor(ne(_0x444372, _0x4fc3f0, 5100) * 8);
      for (let _0x2b1b41 = 0; _0x2b1b41 < _0x397f3e && _0x324d25 < 50000; _0x2b1b41++) {
        const _0x12a942 = ne(_0x444372, _0x4fc3f0, 5200 + _0x2b1b41);
        const _0x4edfd3 = (ne(_0x444372, _0x4fc3f0, 5300 + _0x2b1b41) - 0.5) * 0.85;
        const _0x2a8cec = (ne(_0x444372, _0x4fc3f0, 5400 + _0x2b1b41) - 0.5) * 0.85;
        const _0x4f9ab8 = $ * (0.5 + ne(_0x444372, _0x4fc3f0, 5500 + _0x2b1b41) * 1.2);
        _0x462aab.push(_0x444372 + _0x4edfd3, _0x4fc3f0 + _0x2a8cec, _0x12a942, _0x4f9ab8);
        _0x324d25++;
      }
    }
  }
  const _0x1f8674 = new Float32Array(200000);
  _0x1f8674.set(new Float32Array(_0x462aab));
  return {
    positions: _0x1f8674,
    count: _0x324d25
  };
}
function de(_0x37cd31, _0x5e35d9, _0x56239b = 10) {
  const _0x75b573 = _0x5e35d9 * $ * 0.5;
  const _0x3ae270 = [];
  let _0x1c586e = 0;
  if (_0x37cd31.length === 0) {
    return {
      positions: new Float32Array(_0x56239b * 4),
      count: 0
    };
  }
  for (let _0xe8fadc = 0; _0xe8fadc < _0x56239b; _0xe8fadc++) {
    const _0x3eab59 = _0x37cd31[Math.floor(le(_0xe8fadc, 0, 5000) * _0x37cd31.length) % _0x37cd31.length];
    const _0x2ade1d = le(_0xe8fadc, 0, 5100);
    const _0x7e3341 = le(_0xe8fadc, 0, 5200) * Math.PI * 2;
    const _0x5e1d3a = _0x3eab59.radius * $ * 1.5 * le(_0xe8fadc, 0, 5300);
    const _0x340321 = _0x3eab59.x + Math.cos(_0x7e3341) * _0x5e1d3a;
    const _0x55221a = _0x3eab59.z + Math.sin(_0x7e3341) * _0x5e1d3a;
    const _0xc8920b = _0x3eab59.y + q * (0.5 + le(_0xe8fadc, 0, 5400) * 1);
    const _0x19834c = (_0x340321 + _0x75b573) / $;
    const _0x1748ea = (_0x55221a + _0x75b573) / $;
    _0x3ae270.push(_0x19834c, _0x1748ea, _0xc8920b, _0x2ade1d);
    _0x1c586e++;
  }
  const _0x4f6eb1 = new Float32Array(_0x56239b * 4);
  _0x4f6eb1.set(new Float32Array(_0x3ae270));
  return {
    positions: _0x4f6eb1,
    count: _0x1c586e
  };
}
function pe(_0x35dd00) {
  const _0x3e6c3b = new Float32Array(2000);
  const _0x1a5dc8 = _0x35dd00 * 1.2;
  for (let _0x46d318 = 0; _0x46d318 < 500; _0x46d318++) {
    const _0xd74b3e = le(_0x46d318, 0, 8000) * _0x1a5dc8 - (_0x1a5dc8 - _0x35dd00) * 0.5;
    const _0x419de7 = le(_0x46d318, 0, 8100) * _0x1a5dc8 - (_0x1a5dc8 - _0x35dd00) * 0.5;
    const _0x1ba7a5 = le(_0x46d318, 0, 8200);
    const _0x2fb8b5 = le(_0x46d318, 0, 8300);
    _0x3e6c3b[_0x46d318 * 4] = _0xd74b3e;
    _0x3e6c3b[_0x46d318 * 4 + 1] = _0x419de7;
    _0x3e6c3b[_0x46d318 * 4 + 2] = _0x1ba7a5;
    _0x3e6c3b[_0x46d318 * 4 + 3] = _0x2fb8b5;
  }
  return {
    positions: _0x3e6c3b,
    count: 500
  };
}
function he(_0x24d894) {
  const _0x4d6338 = _0x24d894 * 0.46;
  const _0x561931 = new Float32Array(40);
  for (let _0x2395f5 = 0; _0x2395f5 < 10; _0x2395f5++) {
    const _0x48b245 = _0x4d6338 * (0.35 + le(_0x2395f5, 0, 9000) * 0.55);
    const _0x3cb79c = 0.25 + le(_0x2395f5, 0, 9100) * 0.3;
    const _0x2ac722 = 4 + le(_0x2395f5, 0, 9200) * 9;
    const _0x1914ee = le(_0x2395f5, 0, 9300);
    _0x561931[_0x2395f5 * 4] = _0x48b245;
    _0x561931[_0x2395f5 * 4 + 1] = _0x3cb79c;
    _0x561931[_0x2395f5 * 4 + 2] = _0x2ac722;
    _0x561931[_0x2395f5 * 4 + 3] = _0x1914ee;
  }
  return {
    positions: _0x561931,
    count: 10
  };
}
function ge(_0x316ce1, _0xbf09a2) {
  return _0x316ce1.createBuffer({
    size: _0xbf09a2,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
}
function me(_0x24430e, _0x1678a2) {
  return _0x24430e.createBuffer({
    size: _0x1678a2,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });
}
var ve = {
  color: {
    srcFactor: "one",
    dstFactor: "one-minus-src-alpha",
    operation: "add"
  },
  alpha: {
    srcFactor: "one",
    dstFactor: "one-minus-src-alpha",
    operation: "add"
  }
};
function be(_0x5396fb, _0x4417a4, _0x2c83d9, _0x438831) {
  const _0x5688cb = _0x5396fb.createShaderModule({
    code: _0x438831.vertex
  });
  const _0x391502 = _0x5396fb.createShaderModule({
    code: _0x438831.fragment
  });
  _0x5688cb.getCompilationInfo().then(_0x325ab5 => {
    for (const _0x42c623 of _0x325ab5.messages) {
      if (_0x42c623.type === "error") {
        console.error("Vertex shader error:", _0x42c623.message, "line:", _0x42c623.lineNum);
      }
    }
  });
  _0x391502.getCompilationInfo().then(_0x8dadc2 => {
    for (const _0x3225f8 of _0x8dadc2.messages) {
      if (_0x3225f8.type === "error") {
        console.error("Fragment shader error:", _0x3225f8.message, "line:", _0x3225f8.lineNum);
      }
    }
  });
  return _0x5396fb.createRenderPipeline({
    layout: _0x5396fb.createPipelineLayout({
      bindGroupLayouts: [_0x2c83d9]
    }),
    vertex: {
      module: _0x5688cb,
      entryPoint: "main"
    },
    fragment: {
      module: _0x391502,
      entryPoint: "main",
      targets: [{
        format: _0x4417a4,
        blend: _0x438831.blend ?? ve
      }]
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "none"
    },
    depthStencil: {
      depthWriteEnabled: _0x438831.depthWrite,
      depthCompare: _0x438831.depthCompare,
      format: "depth24plus"
    }
  });
}
var ye = "\nstruct Uniforms {\n  aspectRatio: f32,\n  time: f32,\n  blockCount: f32,\n  progress: f32,\n  gridSize: f32,\n  cameraBobX: f32,\n  cameraBobY: f32,\n  season: f32,       // 0=spring, 1=summer, 2=autumn\n  burstTime: f32,    // time when burst was triggered\n  customR: f32,      // custom flower color R\n  customG: f32,      // custom flower color G\n  customB: f32,      // custom flower color B\n  customStrength: f32, // blend strength for custom color\n  rainMode: f32,     // 0=clear, 1=rain (auto for autumn)\n  trunkSeed: f32,   // 0..1 per-session bark variation seed\n  _pad2: f32,\n}\n";
function we(_0x1e8f73 = "localPos") {
  return "\n  let isoAngleY = mix(0.78, 0, progress) + uniforms.cameraBobX;\n  let isoAngleX = mix(-0.55, -1.5708, progress) + uniforms.cameraBobY;\n\n  let cy = cos(isoAngleY); let sy = sin(isoAngleY);\n  let cx = cos(isoAngleX); let sx = sin(isoAngleX);\n\n  let ry_x = " + _0x1e8f73 + ".x * cy - " + _0x1e8f73 + ".z * sy;\n  let ry_z = " + _0x1e8f73 + ".x * sy + " + _0x1e8f73 + ".z * cy;\n  let rx_y = " + _0x1e8f73 + ".y * cx - ry_z * sx;\n  let rx_z = " + _0x1e8f73 + ".y * sx + ry_z * cx;\n\n  let portraitBoost = select(1.0, 1.2, uniforms.aspectRatio < 0.8);\n  let viewScale = (mix(" + 45.0.toFixed(2) + ", " + 46.400000000000006.toFixed(2) + ", progress) / uniforms.gridSize) * portraitBoost;\n  let ar = uniforms.aspectRatio;\n  let scaleX = viewScale / max(ar, 1.0);\n  let scaleY = viewScale / max(1.0 / ar, 1.0);\n\n  let yOffsetScene = mix(-0.15, 0.08, progress);\n  let xOffsetScene = mix(0.0, 0.015, progress);\n";
}
var ke = "0.0245";
var xe = "\nfn acesFilm(x: vec3f) -> vec3f {\n  let a = 2.51; let b = 0.03; let c = 2.43; let d = 0.59; let e = 0.14;\n  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), vec3f(0.0), vec3f(1.0));\n}\n";
function Se(_0x113124, _0x78f0a7, _0x17b9d1, _0x48fd67, _0x88c97d, _0x5114a0, _0x3fdc95, _0x57feaf, _0x2a9b8a, _0x6807c1) {
  const {
    device: _0xf2fdd0,
    buffers: _0x5ccbaf
  } = _0x113124;
  (function (_0x257095, _0x15a120, _0x51230d) {
    _0x257095.queue.writeBuffer(_0x15a120.typeBuffer, 0, _0x51230d.types);
    _0x257095.queue.writeBuffer(_0x15a120.posBuffer, 0, _0x51230d.positions);
    _0x257095.queue.writeBuffer(_0x15a120.heightBuffer, 0, _0x51230d.heights);
    _0x257095.queue.writeBuffer(_0x15a120.baseYBuffer, 0, _0x51230d.baseY);
  })(_0xf2fdd0, _0x5ccbaf, _0x78f0a7);
  _0x113124.counts.numBlocks = _0x78f0a7.numBlocks;
  _0x113124.counts.gridSize = _0x78f0a7.gridSize;
  const _0x20a40f = _0x113124._branchUpload;
  _0x20a40f.fill(0);
  _0x20a40f.set(_0x17b9d1.segments);
  _0xf2fdd0.queue.writeBuffer(_0x5ccbaf.branchBuffer, 0, _0x20a40f);
  _0x113124.counts.segmentCount = _0x17b9d1.segmentCount;
  const _0x5df3cd = _0x48fd67.count + _0x5114a0;
  const _0x2d3ed0 = _0x113124._flowerUpload;
  _0x2d3ed0.fill(0);
  _0x2d3ed0.set(_0x48fd67.positions);
  for (let _0x293520 = 0; _0x293520 < _0x5114a0 * 4; _0x293520++) {
    _0x2d3ed0[_0x48fd67.count * 4 + _0x293520] = _0x88c97d[_0x293520];
  }
  _0xf2fdd0.queue.writeBuffer(_0x5ccbaf.flowerBuffer, 0, _0x2d3ed0);
  _0x113124.counts.flowerCount = _0x5df3cd;
  _0xf2fdd0.queue.writeBuffer(_0x5ccbaf.grassBuffer, 0, _0x3fdc95.positions);
  _0x113124.counts.grassCount = _0x3fdc95.count;
  const _0x19e583 = _0x113124._petalUpload;
  _0x19e583.fill(0);
  _0x19e583.set(_0x57feaf.positions);
  _0xf2fdd0.queue.writeBuffer(_0x5ccbaf.fallingPetalBuffer, 0, _0x19e583);
  _0x113124.counts.petalCount = _0x57feaf.count;
  if (_0x2a9b8a) {
    const _0x218fe3 = _0x113124._rainUpload;
    _0x218fe3.fill(0);
    _0x218fe3.set(_0x2a9b8a.positions);
    _0xf2fdd0.queue.writeBuffer(_0x5ccbaf.rainBuffer, 0, _0x218fe3);
    _0x113124.counts.rainCount = _0x2a9b8a.count;
  }
  if (_0x6807c1) {
    const _0x9b7c82 = _0x113124._butterflyUpload;
    _0x9b7c82.fill(0);
    _0x9b7c82.set(_0x6807c1.positions);
    _0xf2fdd0.queue.writeBuffer(_0x5ccbaf.butterflyBuffer, 0, _0x9b7c82);
    _0x113124.counts.butterflyCount = _0x6807c1.count;
  }
}
function Ce(_0x778c68, _0x4a15bf) {
  const {
    device: _0x5980a0,
    context: _0x36df41,
    buffers: _0x5ce5cf,
    pipelines: _0x5e02fb,
    bindGroups: _0x1ff786,
    counts: _0x115046
  } = _0x778c68;
  const _0x49c9f6 = _0x778c68._uniformArr;
  _0x49c9f6[0] = _0x778c68.aspectRatio;
  _0x49c9f6[1] = _0x4a15bf.time;
  _0x49c9f6[3] = _0x4a15bf.progress;
  _0x49c9f6[4] = _0x115046.gridSize;
  _0x49c9f6[5] = _0x4a15bf.cameraBobX;
  _0x49c9f6[6] = _0x4a15bf.cameraBobY;
  _0x49c9f6[7] = _0x4a15bf.season;
  _0x49c9f6[8] = _0x4a15bf.burstTime;
  _0x49c9f6[9] = _0x4a15bf.customR;
  _0x49c9f6[10] = _0x4a15bf.customG;
  _0x49c9f6[11] = _0x4a15bf.customB;
  _0x49c9f6[12] = _0x4a15bf.customStrength;
  _0x49c9f6[13] = _0x4a15bf.rainMode;
  _0x49c9f6[14] = _0x4a15bf.trunkSeed;
  _0x49c9f6[15] = 0;
  _0x49c9f6[2] = _0x115046.numBlocks;
  _0x5980a0.queue.writeBuffer(_0x5ce5cf.blockUniforms, 0, _0x49c9f6);
  _0x49c9f6[2] = _0x115046.segmentCount;
  _0x5980a0.queue.writeBuffer(_0x5ce5cf.branchUniforms, 0, _0x49c9f6);
  _0x49c9f6[2] = _0x115046.grassCount;
  _0x5980a0.queue.writeBuffer(_0x5ce5cf.grassUniforms, 0, _0x49c9f6);
  _0x49c9f6[2] = _0x115046.petalCount;
  _0x5980a0.queue.writeBuffer(_0x5ce5cf.petalUniforms, 0, _0x49c9f6);
  _0x49c9f6[2] = _0x115046.rainCount;
  _0x5980a0.queue.writeBuffer(_0x5ce5cf.rainUniforms, 0, _0x49c9f6);
  _0x49c9f6[2] = _0x115046.butterflyCount;
  _0x5980a0.queue.writeBuffer(_0x5ce5cf.butterflyUniforms, 0, _0x49c9f6);
  const _0x1728fc = _0x5980a0.createCommandEncoder();
  const _0xb56c7c = _0x36df41.getCurrentTexture().createView();
  const _0x202404 = !_0x778c68.isMobile && _0x4a15bf.progress > 0 && _0x4a15bf.progress < 1 && _0x5e02fb.blur;
  const _0x235809 = _0x202404 ? _0x778c68.sceneTextureView : _0xb56c7c;
  const _0x11b771 = _0x1728fc.beginRenderPass({
    colorAttachments: [{
      view: _0x235809,
      clearValue: _0x4a15bf.season > 2.5 ? { r: 0.88, g: 0.91, b: 0.94, a: 1 } : { r: 0.965, g: 0.945, b: 0.906, a: 1 },
      loadOp: "clear",
      storeOp: "store"
    }],
    depthStencilAttachment: {
      view: _0x778c68.depthTextureView,
      depthClearValue: 1,
      depthLoadOp: "clear",
      depthStoreOp: "store"
    }
  });
  _0x11b771.setPipeline(_0x5e02fb.sky);
  _0x11b771.setBindGroup(0, _0x1ff786.sky);
  _0x11b771.draw(3);
  _0x11b771.setPipeline(_0x5e02fb.shadow);
  _0x11b771.setBindGroup(0, _0x1ff786.shadow);
  _0x11b771.draw(6);
  _0x11b771.setPipeline(_0x5e02fb.blocks);
  _0x11b771.setBindGroup(0, _0x1ff786.blocks);
  _0x11b771.draw(_0x115046.numBlocks * 36);
  if (_0x115046.grassCount > 0 && _0x5e02fb.grass) {
    _0x11b771.setPipeline(_0x5e02fb.grass);
    _0x11b771.setBindGroup(0, _0x1ff786.grass);
    _0x11b771.draw(_0x115046.grassCount * 3);
  }
  if (_0x115046.segmentCount > 0 && _0x5e02fb.branches) {
    _0x11b771.setPipeline(_0x5e02fb.branches);
    _0x11b771.setBindGroup(0, _0x1ff786.branches);
    _0x11b771.draw(_0x115046.segmentCount * 48);
  }
  if (_0x115046.flowerCount > 0) {
    _0x11b771.setPipeline(_0x5e02fb.flowers);
    _0x11b771.setBindGroup(0, _0x1ff786.flowers);
    _0x11b771.draw(_0x115046.flowerCount * 150);
  }
  if (_0x115046.petalCount > 0 && _0x5e02fb.fallingPetals) {
    _0x11b771.setPipeline(_0x5e02fb.fallingPetals);
    _0x11b771.setBindGroup(0, _0x1ff786.fallingPetals);
    _0x11b771.draw(_0x115046.petalCount * 150);
  }
  if (_0x115046.rainCount > 0 && _0x5e02fb.rain && _0x4a15bf.rainMode > 0.01) {
    _0x11b771.setPipeline(_0x5e02fb.rain);
    _0x11b771.setBindGroup(0, _0x1ff786.rain);
    _0x11b771.draw(_0x115046.rainCount * 6);
  }
  if (_0x115046.butterflyCount > 0 && _0x5e02fb.butterflies) {
    _0x11b771.setPipeline(_0x5e02fb.butterflies);
    _0x11b771.setBindGroup(0, _0x1ff786.butterflies);
    _0x11b771.draw(_0x115046.butterflyCount * 6);
  }
  _0x11b771.end();
  if (_0x202404) {
    const _0x403294 = _0x1728fc.beginRenderPass({
      colorAttachments: [{
        view: _0xb56c7c,
        clearValue: {
          r: 0,
          g: 0,
          b: 0,
          a: 1
        },
        loadOp: "clear",
        storeOp: "store"
      }]
    });
    _0x403294.setPipeline(_0x5e02fb.blur);
    _0x403294.setBindGroup(0, _0x1ff786.blur);
    _0x403294.draw(3);
    _0x403294.end();
  }
  _0x5980a0.queue.submit([_0x1728fc.finish()]);
}
function Ee(_0x2fd5e7) {
  let _0x4d2441 = 0;
  for (let _0x947d6d = 0; _0x947d6d < _0x2fd5e7.length; _0x947d6d++) {
    _0x4d2441 = Math.imul(31, _0x4d2441) + _0x2fd5e7.charCodeAt(_0x947d6d) | 0;
  }
  return Math.abs(_0x4d2441) % 99991 + 1;
}
export function useMagicTree(_0xed4da) {
    const {
      canvasRef: _0xc8ac50,
      canvasWidth: _0x1b3318,
      canvasHeight: _0x1f69fa,
      qrContent: _0x582982,
      isFlat: _0x357820,
      seasonRef: _0x45ded0,
      customColorRef: _0x2728d7,
      treeSeed: _0x5399fb,
      qrSnapshotRef: _0x1ddb2b,
      onFlatSettled: _0x3d1546,
      onQrSnapshotUpdated: _0x1e3edc
    } = _0xed4da;
    const disposed = m.useRef(false);
    const _0x41e5ac = (0, m.useRef)(null);
    const _0x9a37bd = (0, m.useRef)(false);
    const _0x6f8fc9 = (0, m.useRef)(null);
    const _0x366195 = (0, m.useRef)(Date.now());
    const _0x27739d = (0, m.useRef)(null);
    const _0x2c7cf4 = (0, m.useRef)(0);
    const _0x4c7277 = (0, m.useRef)(0);
    const _0x5b6917 = (0, m.useRef)(Date.now());
    const _0x2323cd = (0, m.useRef)(_0x582982);
    _0x2323cd.current = _0x582982;
    const _0x4e7fe7 = (0, m.useRef)(_0x582982);
    const _0x26693f = (0, m.useRef)(0);
    const _0x43f2cb = (0, m.useRef)(null);
    const _0x28866d = (0, m.useRef)(null);
    const _0x4531f4 = (0, m.useRef)(0);
    const _0x5dd6ef = (Ee(_0x5399fb.current) - 1) / 99990;
    const _0x38b120 = (0, m.useRef)(0);
    const _0x518aa4 = (0, m.useRef)(false);
    const _0x4d86e9 = (0, m.useRef)(0);
    (0, m.useEffect)(() => {
      const _0x3b8292 = _0x27739d.current;
      if (!_0x3b8292) {
        return;
      }
      const _0x395d73 = ee(_0x582982);
      const _0x4340e1 = ae(_0x395d73);
      const _0xb533ad = ie(_0x395d73);
      _0x43f2cb.current = _0x395d73;
      _0x28866d.current = _0xb533ad;
      _0x4531f4.current = _0x4340e1.gridSize;
      oe(Ee(_0x5399fb.current));
      const _0x480944 = se(_0xb533ad, _0x4340e1.gridSize);
      const _0x24768e = ue(_0x480944.tips, _0xb533ad);
      const _0x3dabd4 = ce(_0x395d73);
      const _0x30fbf7 = fe(_0x4340e1.gridSize, _0x395d73);
      const _0x414ed0 = de(_0x480944.tips, _0x4340e1.gridSize);
      const _0x4eee01 = pe(_0x4340e1.gridSize);
      const _0x30e15d = he(_0x4340e1.gridSize);
      Se(_0x3b8292, _0x4340e1, _0x480944, _0x24768e, _0x3dabd4.positions, _0x3dabd4.count, _0x30fbf7, _0x414ed0, _0x4eee01, _0x30e15d);
      _0x4e7fe7.current = _0x582982;
    }, [_0x582982]);
    const _0x354f89 = (0, m.useCallback)(async () => {
      try {
        if (_0x27739d.current || _0x9a37bd.current) {
          return;
        }
        if (_0x1b3318 <= 0 || _0x1f69fa <= 0) {
          return;
        }
        const _0x3404a9 = _0xc8ac50.current;
        if (!_0x3404a9) {
          return;
        }
        _0x9a37bd.current = true;
        const _0x2c9dd9 = await async function (_0x3965a8, _0x99bdef, _0xf44ff4) {
          const _0x3f70a1 = _0x3965a8.getContext("webgpu");
          if (!_0x3f70a1) {
            return null;
          }
          const _0x1e2627 = await navigator.gpu?.requestAdapter();
          if (!_0x1e2627) {
            return null;
          }
          const _0x2cc8ca = await _0x1e2627.requestDevice();
          if (disposed.current) { _0x2cc8ca.destroy(); return null; }
          _0x2cc8ca.addEventListener("uncapturederror", () => { if (!disposed.current) _0xed4da.onError(); });
          _0x2cc8ca.lost.then(() => { if (!disposed.current) _0xed4da.onError(); });
          const _0x1614a7 = navigator.gpu.getPreferredCanvasFormat();
          const _0x2635ba = Math.min(window.devicePixelRatio || 1, 2);
          _0x3965a8.width = Math.max(1, Math.floor(_0x99bdef * _0x2635ba));
          _0x3965a8.height = Math.max(1, Math.floor(_0xf44ff4 * _0x2635ba));
          _0x3f70a1.configure({
            device: _0x2cc8ca,
            format: _0x1614a7,
            alphaMode: "premultiplied"
          });
          const _0x3900da = ge(_0x2cc8ca, 64);
          const _0x49b52a = ge(_0x2cc8ca, 64);
          const _0x46b627 = ge(_0x2cc8ca, 64);
          const _0x595d58 = ge(_0x2cc8ca, 64);
          const _0x517713 = ge(_0x2cc8ca, 64);
          const _0x2df518 = ge(_0x2cc8ca, 64);
          const _0x11bbe2 = me(_0x2cc8ca, 268960);
          const _0x28d692 = me(_0x2cc8ca, 1075840);
          const _0x1476a0 = me(_0x2cc8ca, 268960);
          const _0x1261f1 = me(_0x2cc8ca, 268960);
          const _0x3021ae = me(_0x2cc8ca, 1600000);
          const _0x377a4d = me(_0x2cc8ca, 24000);
          const _0x2be32b = me(_0x2cc8ca, 800000);
          const _0x59e82c = me(_0x2cc8ca, 160);
          const _0x47a094 = me(_0x2cc8ca, 8000);
          const _0x4ad745 = me(_0x2cc8ca, 160);
          const _0x4ba824 = _0x2cc8ca.createBindGroupLayout({
            entries: [{
              binding: 0,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
              buffer: {
                type: "uniform"
              }
            }, {
              binding: 1,
              visibility: GPUShaderStage.VERTEX,
              buffer: {
                type: "read-only-storage"
              }
            }, {
              binding: 2,
              visibility: GPUShaderStage.VERTEX,
              buffer: {
                type: "read-only-storage"
              }
            }, {
              binding: 3,
              visibility: GPUShaderStage.VERTEX,
              buffer: {
                type: "read-only-storage"
              }
            }, {
              binding: 4,
              visibility: GPUShaderStage.VERTEX,
              buffer: {
                type: "read-only-storage"
              }
            }]
          });
          const _0x4c8b61 = _0x2cc8ca.createBindGroupLayout({
            entries: [{
              binding: 0,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
              buffer: {
                type: "uniform"
              }
            }]
          });
          const _0xc01810 = _0x2cc8ca.createBindGroupLayout({
            entries: [{
              binding: 0,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
              buffer: {
                type: "uniform"
              }
            }, {
              binding: 1,
              visibility: GPUShaderStage.VERTEX,
              buffer: {
                type: "read-only-storage"
              }
            }]
          });
          const _0x3272ff = _0x2cc8ca.createBindGroup({
            layout: _0x4ba824,
            entries: [{
              binding: 0,
              resource: {
                buffer: _0x3900da
              }
            }, {
              binding: 1,
              resource: {
                buffer: _0x11bbe2
              }
            }, {
              binding: 2,
              resource: {
                buffer: _0x28d692
              }
            }, {
              binding: 3,
              resource: {
                buffer: _0x1476a0
              }
            }, {
              binding: 4,
              resource: {
                buffer: _0x1261f1
              }
            }]
          });
          const _0x10cde2 = _0x2cc8ca.createBindGroup({
            layout: _0x4c8b61,
            entries: [{
              binding: 0,
              resource: {
                buffer: _0x3900da
              }
            }]
          });
          const _0x4cdd33 = _0x2cc8ca.createBindGroup({
            layout: _0xc01810,
            entries: [{
              binding: 0,
              resource: {
                buffer: _0x3900da
              }
            }, {
              binding: 1,
              resource: {
                buffer: _0x3021ae
              }
            }]
          });
          const _0x221957 = _0x2cc8ca.createBindGroup({
            layout: _0xc01810,
            entries: [{
              binding: 0,
              resource: {
                buffer: _0x49b52a
              }
            }, {
              binding: 1,
              resource: {
                buffer: _0x377a4d
              }
            }]
          });
          const _0x30997a = _0x2cc8ca.createBindGroup({
            layout: _0xc01810,
            entries: [{
              binding: 0,
              resource: {
                buffer: _0x46b627
              }
            }, {
              binding: 1,
              resource: {
                buffer: _0x2be32b
              }
            }]
          });
          const _0x507dc = _0x2cc8ca.createBindGroup({
            layout: _0xc01810,
            entries: [{
              binding: 0,
              resource: {
                buffer: _0x595d58
              }
            }, {
              binding: 1,
              resource: {
                buffer: _0x59e82c
              }
            }]
          });
          const _0x542379 = _0x2cc8ca.createBindGroup({
            layout: _0xc01810,
            entries: [{
              binding: 0,
              resource: {
                buffer: _0x517713
              }
            }, {
              binding: 1,
              resource: {
                buffer: _0x47a094
              }
            }]
          });
          const _0x1cc244 = _0x2cc8ca.createBindGroup({
            layout: _0xc01810,
            entries: [{
              binding: 0,
              resource: {
                buffer: _0x2df518
              }
            }, {
              binding: 1,
              resource: {
                buffer: _0x4ad745
              }
            }]
          });
          const _0xf57c94 = be(_0x2cc8ca, _0x1614a7, _0x4c8b61, {
            vertex: "\n" + ye + "\n\nstruct SkyOut {\n  @builtin(position) position: vec4f,\n  @location(0) uv: vec2f,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n@vertex\nfn main(@builtin(vertex_index) vi: u32) -> SkyOut {\n  var tri = array<vec2f, 3>(\n    vec2f(-1.0, -1.0),\n    vec2f(3.0, -1.0),\n    vec2f(-1.0, 3.0)\n  );\n  let p = tri[vi];\n  var o: SkyOut;\n  o.position = vec4f(p, 1.0, 1.0);\n  o.uv = vec2f(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);\n  return o;\n}\n",
            fragment: "\n" + ye + "\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n@fragment\nfn main(@location(0) uv: vec2f) -> @location(0) vec4f {\n  let season = uniforms.season;\n  if (season > 2.5) {\n    // Soft, poetic misty winter paper tone (harmonious with spring/summer/autumn)\n    let topCol = vec3f(0.82, 0.86, 0.90);\n    let botCol = vec3f(0.91, 0.94, 0.96);\n    let t = smoothstep(0.0, 1.0, uv.y);\n    let sky = mix(topCol, botCol, t);\n    return vec4f(sky, 1.0);\n  }\n  return vec4f(0.965, 0.945, 0.906, 1.0);\n}\n",
            depthWrite: false,
            depthCompare: "always"
          });
          const _0x59a269 = be(_0x2cc8ca, _0x1614a7, _0x4c8b61, {
            vertex: "\n" + ye + "\n\nstruct ShadowOut {\n  @builtin(position) position: vec4f,\n  @location(0) uv: vec2f,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n@vertex\nfn main(@builtin(vertex_index) vi: u32) -> ShadowOut {\n  var quadVerts = array<vec2f, 6>(\n    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),\n    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0)\n  );\n\n  let qv = quadVerts[vi];\n  var o: ShadowOut;\n  o.uv = qv * 0.5 + 0.5;\n\n  let gridSize = uniforms.gridSize;\n  let blockSize = 0.0245;\n  let halfGrid = gridSize * blockSize * 0.5;\n  let shadowScale = 0.85;\n\n  let progress = uniforms.progress;\n  let shadowHeight = 0.48;\n  let lightDirXZ = vec2f(-0.5, -0.5);\n  let shadowOffset = -lightDirXZ * shadowHeight * 0.35 * (1.0 - progress);\n\n  let localX = qv.x * halfGrid * shadowScale + shadowOffset.x;\n  let localY = -shadowHeight;\n  let localZ = qv.y * halfGrid * shadowScale + shadowOffset.y;\n\n  let isoAngleY = mix(0.78, 0, progress) + uniforms.cameraBobX;\n  let isoAngleX = mix(-0.55, -1.5708, progress) + uniforms.cameraBobY;\n\n  let cy = cos(isoAngleY); let sy = sin(isoAngleY);\n  let cx = cos(isoAngleX); let sx = sin(isoAngleX);\n\n  let ry_x = localX * cy - localZ * sy;\n  let ry_z = localX * sy + localZ * cy;\n  let rx_y = localY * cx - ry_z * sx;\n  let rx_z = localY * sx + ry_z * cx;\n\n  let viewScale = mix(1.3, 1.6, progress);\n  let ar = uniforms.aspectRatio;\n  let scaleX = viewScale / max(ar, 1.0);\n  let scaleY = viewScale / max(1.0 / ar, 1.0);\n\n  let yOffsetScene = mix(0.0, 0.08, progress);\n  let xOffsetScene = mix(0.0, 0.015, progress);\n\n  o.position = vec4f(\n    (ry_x + xOffsetScene) * scaleX,\n    (rx_y + yOffsetScene) * scaleY,\n    0.99,\n    1.0\n  );\n\n  return o;\n}\n",
            fragment: "\n" + ye + "\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n@fragment\nfn main(@location(0) uv: vec2f) -> @location(0) vec4f {\n  return vec4f(0.0, 0.0, 0.0, 0.0);\n}\n",
            depthWrite: false,
            depthCompare: "always",
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
              },
              alpha: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
              }
            }
          });
          const _0xafe3b5 = be(_0x2cc8ca, _0x1614a7, _0x4ba824, {
            vertex: "\n" + ye + "\n\nstruct BlockOutput {\n  @builtin(position) position: vec4f,\n  @location(0) uv: vec2f,\n  @location(1) faceNx: f32,\n  @location(2) faceNy: f32,\n  @location(3) faceNz: f32,\n  @location(4) blockType: f32,\n  @location(5) blockH: f32,\n  @location(6) col: f32,\n  @location(7) row: f32,\n  @location(8) layer: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n@group(0) @binding(1) var<storage, read> blockTypes: array<u32>;\n@group(0) @binding(2) var<storage, read> blockPositions: array<vec4f>;\n@group(0) @binding(3) var<storage, read> blockHeights: array<f32>;\n@group(0) @binding(4) var<storage, read> blockBaseY: array<f32>;\n\n@vertex\nfn main(@builtin(vertex_index) vertexIndex: u32) -> BlockOutput {\n  var output: BlockOutput;\n  let blockIdx = vertexIndex / 36u;\n  let localVertIdx = vertexIndex % 36u;\n  let faceIdx = localVertIdx / 6u;\n  let vertIdx = localVertIdx % 6u;\n\n  let blockCount = u32(uniforms.blockCount);\n  if (blockIdx >= blockCount) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let posData = blockPositions[blockIdx];\n  let col = posData.x;\n  let row = posData.y;\n  output.col = col;\n  output.row = row;\n  output.layer = blockBaseY[blockIdx] / " + ke + ";\n\n  let gridSize = uniforms.gridSize;\n  let blockSize = " + ke + ";\n  let halfGrid = gridSize * blockSize * 0.5;\n  let cubeSize = blockSize;\n\n  let baseX = col * blockSize - halfGrid;\n  let baseY = blockBaseY[blockIdx];\n  let baseZ = row * blockSize - halfGrid;\n  let h = cubeSize;\n  output.blockH = h;\n\n  let typePacked = blockTypes[blockIdx];\n  output.blockType = f32(typePacked);\n\n  let quadVerts = array<vec2f, 6>(\n    vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),\n    vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0)\n  );\n  let qv = quadVerts[vertIdx];\n  let hw = cubeSize * 0.5;\n  let hd = cubeSize * 0.5;\n\n  var localPos = vec3f(0.0);\n  var normal = vec3f(0.0);\n\n  var swayX = 0.0;\n  var swayZ = 0.0;\n  if (typePacked == 1u && h > 0.15) {\n    let time = uniforms.time;\n    swayX = sin(time * 0.8 + col * 0.3 + row * 0.2) * 0.002 * h;\n    swayZ = sin(time * 0.6 + col * 0.2 + row * 0.4) * 0.0015 * h;\n  }\n\n  if (faceIdx == 0u) {\n    localPos = vec3f(baseX + (qv.x - 0.5) * cubeSize + swayX, baseY + h, baseZ + (qv.y - 0.5) * cubeSize + swayZ);\n    normal = vec3f(0.0, 1.0, 0.0);\n  } else if (faceIdx == 1u) {\n    localPos = vec3f(baseX + (qv.x - 0.5) * cubeSize, baseY, baseZ + (0.5 - qv.y) * cubeSize);\n    normal = vec3f(0.0, -1.0, 0.0);\n  } else if (faceIdx == 2u) {\n    localPos = vec3f(baseX + (qv.x - 0.5) * cubeSize + swayX * qv.y, baseY + qv.y * h, baseZ + hd + swayZ * qv.y);\n    normal = vec3f(0.0, 0.0, 1.0);\n  } else if (faceIdx == 3u) {\n    localPos = vec3f(baseX + (0.5 - qv.x) * cubeSize + swayX * qv.y, baseY + qv.y * h, baseZ - hd + swayZ * qv.y);\n    normal = vec3f(0.0, 0.0, -1.0);\n  } else if (faceIdx == 4u) {\n    localPos = vec3f(baseX + hw + swayX * qv.y, baseY + qv.y * h, baseZ + (qv.x - 0.5) * cubeSize + swayZ * qv.y);\n    normal = vec3f(1.0, 0.0, 0.0);\n  } else {\n    localPos = vec3f(baseX - hw + swayX * qv.y, baseY + qv.y * h, baseZ + (0.5 - qv.x) * cubeSize + swayZ * qv.y);\n    normal = vec3f(-1.0, 0.0, 0.0);\n  }\n\n  output.uv = qv;\n  output.faceNx = normal.x;\n  output.faceNy = normal.y;\n  output.faceNz = normal.z;\n\n  let progress = uniforms.progress;\n\n  if (typePacked == 2u && baseY > 0.001) {\n    let trunkVis = smoothstep(0.2, 0.6, progress);\n    localPos = vec3f(\n      baseX + (localPos.x - baseX) * trunkVis,\n      baseY + (localPos.y - baseY) * trunkVis,\n      baseZ + (localPos.z - baseZ) * trunkVis,\n    );\n  }\n\n  if (typePacked == 1u) {\n    let cubeVis = smoothstep(0.15, 0.6, progress);\n    localPos = vec3f(\n      baseX + (localPos.x - baseX) * cubeVis,\n      baseY + (localPos.y - baseY) * cubeVis,\n      baseZ + (localPos.z - baseZ) * cubeVis,\n    );\n  }\n\n  if (typePacked == 5u) {\n    let branchVis = smoothstep(0.0, 0.4, 1.0 - progress);\n    localPos = vec3f(\n      baseX + (localPos.x - baseX) * branchVis,\n      baseY + (localPos.y - baseY) * branchVis,\n      baseZ + (localPos.z - baseZ) * branchVis,\n    );\n  }\n\n  " + we() + "\n  \n  output.position = vec4f(\n    (ry_x + xOffsetScene) * scaleX,\n    (rx_y + yOffsetScene) * scaleY,\n    rx_z * 0.01 + 0.5,\n    1.0\n  );\n\n  return output;\n}\n",
            fragment: "\n" + ye + "\n\nstruct BlockInput {\n  @location(0) uv: vec2f,\n  @location(1) faceNx: f32,\n  @location(2) faceNy: f32,\n  @location(3) faceNz: f32,\n  @location(4) blockType: f32,\n  @location(5) blockH: f32,\n  @location(6) col: f32,\n  @location(7) row: f32,\n  @location(8) layer: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n" + xe + "\n\n@fragment\nfn main(input: BlockInput) -> @location(0) vec4f {\n  let uv = input.uv;\n  let N = normalize(vec3f(input.faceNx, input.faceNy, input.faceNz));\n  let blockType = i32(input.blockType + 0.5);\n  let progress = uniforms.progress;\n  let season = uniforms.season;\n\n  var dirtLight = vec3f(0.86, 0.80, 0.68);\n  var dirtMid = vec3f(0.80, 0.74, 0.62);\n  var dirtDark = vec3f(0.72, 0.66, 0.54);\n\n  // Summer: dirty earthy brown-beige soil\n  if (season > 0.5 && season < 1.5) {\n    dirtLight = vec3f(0.78, 0.66, 0.52);\n    dirtMid   = vec3f(0.68, 0.57, 0.43);\n    dirtDark  = vec3f(0.56, 0.46, 0.34);\n  }\n\n  var sakuraLight = vec3f(0.88, 0.48, 0.55);\n  var sakuraMid = vec3f(0.78, 0.34, 0.42);\n  var sakuraDeep = vec3f(0.65, 0.24, 0.32);\n  var sakuraRich = vec3f(0.52, 0.16, 0.24);\n\n  // Custom color tint for canopy blocks — saturated\n  let customStr = uniforms.customStrength;\n  if (customStr > 0.01) {\n    let cc = vec3f(uniforms.customR, uniforms.customG, uniforms.customB);\n    sakuraLight = mix(sakuraLight, cc * 1.15, customStr);\n    sakuraMid   = mix(sakuraMid,   cc * 0.90, customStr);\n    sakuraDeep  = mix(sakuraDeep,  cc * 0.70, customStr);\n    sakuraRich  = mix(sakuraRich,  cc * 0.55, customStr);\n  }\n\n  var grassDark = vec3f(0.10, 0.30, 0.06);\n  var grassMid = vec3f(0.16, 0.42, 0.10);\n  var grassBright = vec3f(0.24, 0.52, 0.14);\n\n  if (season > 0.5 && season < 1.5) {\n    sakuraLight = vec3f(0.10, 0.24, 0.03);\n    sakuraMid   = vec3f(0.06, 0.18, 0.02);\n    sakuraDeep  = vec3f(0.04, 0.13, 0.01);\n    sakuraRich  = vec3f(0.02, 0.08, 0.01);\n    grassDark   = vec3f(0.04, 0.16, 0.01);\n    grassMid    = vec3f(0.08, 0.26, 0.02);\n    grassBright = vec3f(0.14, 0.36, 0.04);\n  } else if (season > 1.5 && season < 2.5) {\n    sakuraLight = vec3f(0.74, 0.36, 0.10);\n    sakuraMid   = vec3f(0.62, 0.23, 0.07);\n    sakuraDeep  = vec3f(0.50, 0.15, 0.05);\n    sakuraRich  = vec3f(0.38, 0.10, 0.03);\n    grassDark   = vec3f(0.42, 0.26, 0.08);\n    grassMid    = vec3f(0.56, 0.34, 0.10);\n    grassBright = vec3f(0.68, 0.42, 0.12);\n  }\n\n  let barkLight = vec3f(0.42, 0.24, 0.14);\n  let barkMid = vec3f(0.34, 0.18, 0.10);\n  let barkDark = vec3f(0.24, 0.12, 0.06);\n  let barkDeep = vec3f(0.18, 0.08, 0.04);\n\n  const sunDir = vec3f(-0.405616, 0.861934, -0.304212);\n  let sunCol = vec3f(1.20, 1.20, 1.20);\n  let ambient = vec3f(0.28, 0.28, 0.30);\n  let skyFill = " + J(Z) + ";\n  let bounce = " + J(Q) + ";\n\n  let NdSun = max(dot(N, sunDir), 0.0);\n  let NdUp = max(dot(N, vec3f(0.0, 1.0, 0.0)), 0.0);\n\n  let layer = input.layer;\n  let seed = vec2f(input.col, input.row);\n  let blockSeed = seed.x * 17.3 + seed.y * 31.1 + layer * 73.7;\n  let noise1 = fract(sin(blockSeed) * 43758.5);\n  let noise2 = fract(sin(blockSeed * 1.7 + 127.1) * 43758.5);\n  let noise3 = fract(sin(blockSeed * 2.3 + 311.7) * 43758.5);\n\n  let gridSize = uniforms.gridSize;\n  let cx = gridSize * 0.5;\n  let cy = gridSize * 0.5;\n  let shadowOffsetX = 1.5;\n  let shadowOffsetY = 1.5;\n  let dx = input.col - (cx + shadowOffsetX);\n  let dy = input.row - (cy + shadowOffsetY);\n  let distFromShadowCenter = sqrt(dx * dx + dy * dy);\n  let canopyRadius = gridSize * 0.46;\n  let trunkRadius = 2.5;\n  let shadowT = 1.0 - smoothstep(trunkRadius, canopyRadius, distFromShadowCenter);\n  let trunkAO = (1.0 - smoothstep(0.0, trunkRadius * 1.5, distFromShadowCenter)) * 0.20;\n  let treeShadow = 1.0 - shadowT * 0.35 - trunkAO;\n\n  let maxCanopyLayer = 15.0;\n  let layerRatio = min(layer / maxCanopyLayer, 1.0);\n  let canopyAO = 0.65 + layerRatio * 0.35;\n\n  var albedo = vec3f(0.5);\n\n  if (input.faceNy > 0.5) {\n    let topWarmTint = vec3f(1.1, 1.08, 1.02);\n    let isDarkModule = step(0.5, f32(blockType));\n\n    if (blockType == 0) {\n      var dirtColor = dirtMid;\n      let t = noise1;\n      if (t < 0.4) { dirtColor = mix(dirtLight, dirtMid, t / 0.4); }\n      else if (t < 0.7) { dirtColor = mix(dirtMid, dirtDark, (t - 0.4) / 0.3); }\n      else { dirtColor = mix(dirtDark, dirtDark * 0.85, (t - 0.7) / 0.3); }\n      let shift = (noise2 - 0.5) * 0.18;\n      let grain = (noise3 - 0.5) * 0.08;\n      dirtColor = dirtColor * (1.0 + shift + grain) * treeShadow;\n\n      let distFromCenter = sqrt((input.col - cx) * (input.col - cx) + (input.row - cy) * (input.row - cy));\n      let underCanopy = step(distFromCenter, canopyRadius);\n      let speckleChance = noise3 * underCanopy;\n\n      if (season < 0.5) {\n        let petalTint = vec3f(0.90, 0.72, 0.70);\n        dirtColor = mix(dirtColor, petalTint, step(0.85, speckleChance) * 0.4);\n      } else if (season < 1.5) {\n        let greenSpeck = vec3f(0.55, 0.68, 0.42);\n        dirtColor = mix(dirtColor, greenSpeck, step(0.92, speckleChance) * 0.2);\n      } else if (season < 2.5) {\n        let leafSpeck = mix(vec3f(0.85, 0.52, 0.15), vec3f(0.72, 0.35, 0.10), noise1);\n        dirtColor = mix(dirtColor, leafSpeck, step(0.70, speckleChance) * 0.5);\n      }\n      albedo = dirtColor * topWarmTint;\n\n    } else if (blockType == 1) {\n      var cherryColor = sakuraMid;\n      let t = noise1;\n      if (t < 0.33) { cherryColor = mix(sakuraLight, sakuraMid, t / 0.33); }\n      else if (t < 0.66) { cherryColor = mix(sakuraMid, sakuraDeep, (t - 0.33) / 0.33); }\n      else { cherryColor = mix(sakuraDeep, sakuraRich, (t - 0.66) / 0.34); }\n      let shift = (noise2 - 0.5) * 0.15;\n      cherryColor = cherryColor * (1.0 + shift);\n\n      let edgeX = min(uv.x, 1.0 - uv.x);\n      let edgeY = min(uv.y, 1.0 - uv.y);\n      let edgeDist = min(edgeX, edgeY);\n      let roundedEdge = smoothstep(0.0, 0.12, edgeDist);\n      let edgeDarken = mix(0.88, 1.0, roundedEdge);\n      let finalEdge = mix(edgeDarken, 1.0, progress);\n      albedo = cherryColor * topWarmTint * canopyAO * finalEdge;\n\n    } else if (blockType == 2) {\n      let trunkMaxLayer = 18.0;\n      let heightRatio = min(layer / trunkMaxLayer, 1.0);\n      let sandColor = vec3f(0.85, 0.78, 0.64);\n      let sandShift = (noise1 - 0.5) * 0.1;\n      let groundSand = sandColor * (1.0 + sandShift) * treeShadow;\n\n      var barkColor = mix(barkMid, barkLight, noise1 * 0.4);\n      let shift = (noise2 - 0.5) * 0.15;\n      barkColor = barkColor * (1.0 + shift);\n      let aoShadow = 0.6 + heightRatio * 0.4;\n      let sandBlend = smoothstep(0.0, 0.15, heightRatio);\n      albedo = mix(groundSand, barkColor * aoShadow, sandBlend) * topWarmTint;\n\n    } else if (blockType == 3) {\n      let grassBrown = vec3f(0.28, 0.25, 0.12);\n      let grassOlive = vec3f(0.32, 0.35, 0.15);\n      var grassColor = grassMid;\n      let t = noise1;\n      if (t < 0.3) { grassColor = mix(grassBright, grassMid, t / 0.3); }\n      else if (t < 0.6) { grassColor = mix(grassMid, grassDark, (t - 0.3) / 0.3); }\n      else if (t < 0.8) { grassColor = mix(grassDark, grassBrown, (t - 0.6) / 0.2); }\n      else { grassColor = mix(grassBrown, grassOlive, (t - 0.8) / 0.2); }\n      let shift = (noise2 - 0.5) * 0.2;\n      grassColor = grassColor * (1.0 + shift);\n      albedo = grassColor * topWarmTint;\n\n    } else if (blockType == 5) {\n      var branchColor = mix(barkMid, barkLight, noise1 * 0.5);\n      let bShift = (noise2 - 0.5) * 0.12;\n      branchColor = branchColor * (1.0 + bShift);\n      let ringNoise = sin(noise1 * 12.0 + noise2 * 6.0) * 0.06 + 0.94;\n      albedo = branchColor * ringNoise * topWarmTint * canopyAO;\n\n    } else {\n      let sandA = vec3f(0.84, 0.77, 0.63);\n      let sandB = vec3f(0.80, 0.73, 0.60);\n      let sandPink = vec3f(0.84, 0.74, 0.66);\n      var fallenColor = sandA;\n      if (noise1 < 0.4) { fallenColor = mix(sandA, sandB, noise2); }\n      else if (noise1 < 0.75) { fallenColor = mix(sandB, sandPink, noise2 * 0.5); }\n      else { fallenColor = mix(sandA, sandPink, noise2 * 0.4); }\n      let shift = (noise2 - 0.5) * 0.12;\n      fallenColor = fallenColor * (1.0 + shift) * treeShadow;\n      albedo = fallenColor * topWarmTint;\n    }\n\n    let qrBoost = progress * progress;\n    // Stronger darkening for spring & autumn QR contrast\n    let seasonDark = select(0.0, 0.08, season < 0.5 || season > 1.5);\n    // Extra darkening for light custom colors (Snow) in QR mode\n    let albedoBright = dot(albedo, vec3f(0.299, 0.587, 0.114));\n    let snowExtraDark = mix(0.0, 0.12, smoothstep(0.55, 0.8, albedoBright) * customStr);\n    let darkFactor = mix(0.48, 0.43 - snowExtraDark - seasonDark, qrBoost);\n    // Prevent light QR modules from washing out to gray/white in 2D mode\n    let lightFactor = mix(0.20, 0.36, qrBoost);\n    let lightTarget = vec3f(0.78, 0.70, 0.56);\n    let darkened = albedo * darkFactor;\n    let brightened = mix(albedo, lightTarget, lightFactor);\n    albedo = mix(brightened, darkened, isDarkModule);\n\n  } else if (abs(input.faceNz) > 0.5 || abs(input.faceNx) > 0.5) {\n    let faceN = normalize(vec3f(input.faceNx, input.faceNy, input.faceNz));\n    let sunLight = max(dot(faceN, sunDir), 0.0);\n    let shade = 0.3 + sunLight * 0.65;\n    let tint = vec3f(0.95, 0.95, 0.98);\n\n    if (layer < 1.0 && (blockType == 0 || blockType == 3 || blockType == 4)) {\n      let stoneLight = vec3f(0.78, 0.72, 0.64);\n      let stoneMid = vec3f(0.68, 0.62, 0.54);\n      let stoneDark = vec3f(0.58, 0.52, 0.45);\n      var stoneColor = stoneMid;\n      if (noise1 < 0.35) { stoneColor = mix(stoneLight, stoneMid, noise2); }\n      else if (noise1 < 0.7) { stoneColor = mix(stoneMid, stoneDark, noise2 * 0.6); }\n      else { stoneColor = mix(stoneDark, stoneLight, noise2 * 0.3); }\n      let stoneShift = (noise3 - 0.5) * 0.08;\n      stoneColor = stoneColor * (1.0 + stoneShift);\n      albedo = stoneColor * shade * tint;\n\n    } else if (blockType == 0) {\n      var dirtColor = dirtMid;\n      let t = noise1;\n      if (t < 0.4) { dirtColor = mix(dirtLight, dirtMid, t / 0.4); }\n      else if (t < 0.7) { dirtColor = mix(dirtMid, dirtDark, (t - 0.4) / 0.3); }\n      else { dirtColor = dirtDark * (1.0 - (t - 0.7) * 0.2); }\n      let shift = (noise2 - 0.5) * 0.2;\n      dirtColor = dirtColor * (1.0 + shift);\n      albedo = dirtColor * shade * tint;\n\n    } else if (blockType == 1) {\n      var cherryColor = sakuraMid;\n      let t = noise1;\n      if (t < 0.33) { cherryColor = mix(sakuraLight, sakuraMid, t / 0.33); }\n      else if (t < 0.66) { cherryColor = mix(sakuraMid, sakuraDeep, (t - 0.33) / 0.33); }\n      else { cherryColor = mix(sakuraDeep, sakuraRich, (t - 0.66) / 0.34); }\n      let shift = (noise2 - 0.5) * 0.25;\n      cherryColor = cherryColor * (1.0 + shift);\n      let edgeX = min(uv.x, 1.0 - uv.x);\n      let edgeY = min(uv.y, 1.0 - uv.y);\n      let edgeDist = min(edgeX, edgeY);\n      let roundedEdge = smoothstep(0.0, 0.12, edgeDist);\n      let edgeDarken = mix(0.7, 1.0, roundedEdge);\n      albedo = cherryColor * shade * tint * canopyAO * edgeDarken;\n      if (uniforms.season > 2.5) {\n        let winterSnow = mix(vec3f(0.88, 0.94, 0.99), vec3f(0.98, 0.99, 1.00), noise1);\n        albedo = winterSnow * shade * tint * canopyAO * edgeDarken;\n      }\n\n    } else if (blockType == 2) {\n      let trunkCx = gridSize * 0.5;\n      let trunkCy = gridSize * 0.5;\n      let radX = input.col - trunkCx;\n      let radZ = input.row - trunkCy;\n      let radLen = max(sqrt(radX * radX + radZ * radZ), 0.01);\n      let cylNormalX = radX / radLen;\n      let cylNormalZ = radZ / radLen;\n      let cylN = normalize(vec3f(cylNormalX * 0.8 + faceN.x * 0.2, faceN.y * 0.15, cylNormalZ * 0.8 + faceN.z * 0.2));\n      let cylSunLight = max(dot(cylN, sunDir), 0.0);\n\n      let trunkMaxLayer = 18.0;\n      let heightRatio = min(layer / trunkMaxLayer, 1.0);\n\n      let ts = uniforms.trunkSeed;  // 0..1 per-session bark variation\n\n      let barkAngle = atan2(radZ, radX);\n      let groove1 = sin(barkAngle * (9.0 + ts * 7.0) + noise1 * 2.0) * 0.5 + 0.5;\n      let groove2 = sin(barkAngle * (5.0 + ts * 5.0) + noise2 * 3.5 + 1.7) * 0.5 + 0.5;\n      let groove3 = sin(barkAngle * (16.0 + ts * 8.0) + noise1 * 5.0) * 0.5 + 0.5;\n      let grooveDepth = (groove1 * 0.5 + groove2 * 0.3 + groove3 * 0.2) * 0.25 + 0.75;\n\n      let spiralAngle = barkAngle + heightRatio * (1.8 + ts * 2.0) + noise1 * 0.5;\n      let woodGrain = sin(spiralAngle * (6.0 + ts * 5.0) + layer * 2.0) * 0.08 + 0.92;\n      let ringPattern = sin(layer * (2.0 + ts * 3.5) + noise2 * 4.0) * 0.10 + 0.90;\n      let knotNoise = sin(barkAngle * 3.0 + layer * 5.0 + noise3 * 6.0);\n      let knot = smoothstep(0.85, 0.95, knotNoise) * 0.15;\n\n      var barkColor = mix(barkDark, barkMid, heightRatio * 0.7);\n      barkColor = mix(barkColor, barkLight, groove1 * 0.3);\n      let purpleUndertone = vec3f(0.08, 0.02, 0.10) * heightRatio * 0.3;\n      barkColor = barkColor + purpleUndertone;\n      let shift = (noise2 - 0.5) * 0.18;\n      barkColor = barkColor * (1.0 + shift);\n      barkColor = barkColor - knot;\n      // Seed-based hue variation: warm reddish (ts→1) to cool gray-brown (ts→0)\n      let hueShift = (ts - 0.5) * 0.10;\n      barkColor = clamp(barkColor + vec3f(hueShift, -abs(hueShift) * 0.25, -hueShift * 0.45), vec3f(0.0), vec3f(1.0));\n\n      let edgeFade = 1.0 - smoothstep(0.6, 1.0, abs(dot(cylN, normalize(vec3f(faceN.x, 0.0, faceN.z)))));\n      let cylAO = 0.7 + edgeFade * 0.3;\n      let vertAO = 0.60 + heightRatio * 0.40;\n      let trunkShade = 0.22 + cylSunLight * 0.75;\n      var trunkAlbedo = barkColor * trunkShade * grooveDepth * woodGrain * ringPattern * cylAO * vertAO * tint;\n\n      let sandSideColor = vec3f(0.78, 0.72, 0.58) * shade * tint;\n      let sideBlend = smoothstep(0.0, 0.15, heightRatio);\n      albedo = mix(sandSideColor, trunkAlbedo, sideBlend);\n\n    } else if (blockType == 3) {\n      let grassBrown = vec3f(0.28, 0.25, 0.12);\n      let grassOlive = vec3f(0.32, 0.35, 0.15);\n      var grassColor = grassMid;\n      let t = noise1;\n      if (t < 0.3) { grassColor = mix(grassBright, grassMid, t / 0.3); }\n      else if (t < 0.6) { grassColor = mix(grassMid, grassDark, (t - 0.6) / 0.3); }\n      else if (t < 0.8) { grassColor = mix(grassDark, grassBrown, (t - 0.6) / 0.2); }\n      else { grassColor = mix(grassBrown, grassOlive, (t - 0.8) / 0.2); }\n      let shift = (noise2 - 0.5) * 0.2;\n      grassColor = grassColor * (1.0 + shift);\n      albedo = grassColor * shade * tint;\n      if (uniforms.season > 2.5 && faceN.y > 0.15) {\n        let snowG = mix(vec3f(0.88, 0.93, 0.98), vec3f(0.97, 0.99, 1.00), noise1 * 0.5);\n        albedo = mix(albedo, snowG * shade * tint, smoothstep(0.15, 0.7, faceN.y) * 0.92);\n      }\n\n    } else if (blockType == 5) {\n      var branchColor = mix(barkDark, barkMid, noise1 * 0.6);\n      let grooveSide = sin(layer * 5.0 + noise1 * 3.0) * 0.08 + 0.92;\n      let bShift = (noise2 - 0.5) * 0.15;\n      branchColor = branchColor * (1.0 + bShift) * grooveSide;\n      albedo = branchColor * shade * tint;\n\n    } else {\n      let sandSide = vec3f(0.72, 0.66, 0.52);\n      let sandSideDark = vec3f(0.62, 0.56, 0.44);\n      var fallenColor = mix(sandSide, sandSideDark, noise1 * 0.5);\n      let shift = (noise2 - 0.5) * 0.12;\n      fallenColor = fallenColor * (1.0 + shift);\n      albedo = fallenColor * shade * tint;\n    }\n\n  } else {\n    let bottomTint = vec3f(0.65, 0.62, 0.58);\n    let fallenBottom = vec3f(0.50, 0.45, 0.38);\n\n    if (blockType == 0) { albedo = dirtDark * 0.5 * bottomTint; }\n    else if (blockType == 1) { albedo = sakuraDeep * 0.5 * bottomTint; }\n    else if (blockType == 2) { albedo = barkDark * 0.5 * bottomTint; }\n    else if (blockType == 3) { albedo = grassDark * 0.5 * bottomTint; }\n    else if (blockType == 5) { albedo = barkDark * 0.5 * bottomTint; }\n    else { albedo = fallenBottom * 0.6 * bottomTint; }\n  }\n\n  const viewDir = vec3f(0.398015, 0.597022, 0.696526);\n  let rimDot = 1.0 - max(dot(N, viewDir), 0.0);\n  let rimLight = pow(rimDot, 4.0) * 0.06 * vec3f(0.85, 0.75, 0.95);\n\n  let diffuse = albedo * (ambient + sunCol * NdSun * 0.85 + skyFill * NdUp * 0.18 + bounce * 0.15) + rimLight;\n  var hdr = diffuse;\n  hdr = acesFilm(hdr * 1.15);\n  hdr = pow(hdr, vec3f(1.0 / 2.2));\n\n  let grayB = dot(hdr, vec3f(0.299, 0.587, 0.114));\n  hdr = mix(vec3f(grayB), hdr, 1.25);\n\n  // Rain wet ground effect (hide in QR mode)\n  let rainVis = uniforms.rainMode * (1.0 - progress);\n  if (rainVis > 0.01 && input.faceNy > 0.5 && blockType != 1) {\n    let rainMode = rainVis;\n    // Wet specular highlight\n    let specDir = normalize(vec3f(0.4, 0.9, 0.3));\n    let viewD = normalize(vec3f(0.4, 0.6, 0.7));\n    let half = normalize(specDir + viewD);\n    let spec = pow(max(dot(N, half), 0.0), 32.0) * 0.16 * rainMode;\n    hdr = hdr + vec3f(spec);\n\n    // Darken for wetness\n    hdr = hdr * mix(1.0, 0.88, rainMode);\n\n    // Ripple rings on ground blocks\n    if (blockType == 0 || blockType == 3 || blockType == 4) {\n      let rippleCenter1 = vec2f(input.col + sin(uniforms.time * 1.3 + noise1 * 5.0) * 3.0,\n                                 input.row + cos(uniforms.time * 1.1 + noise2 * 4.0) * 3.0);\n      let rippleCenter2 = vec2f(input.col + sin(uniforms.time * 0.9 + noise2 * 7.0) * 4.0,\n                                 input.row + cos(uniforms.time * 1.5 + noise1 * 3.0) * 4.0);\n      let rd1 = length(vec2f(input.col, input.row) - rippleCenter1);\n      let rd2 = length(vec2f(input.col, input.row) - rippleCenter2);\n      let ripple1 = sin(rd1 * 4.0 - uniforms.time * 6.0) * 0.5 + 0.5;\n      let ripple2 = sin(rd2 * 3.5 - uniforms.time * 5.0) * 0.5 + 0.5;\n      let rippleIntensity = (smoothstep(0.4, 0.6, ripple1) + smoothstep(0.4, 0.6, ripple2)) * 0.015 * rainMode;\n      hdr = hdr + vec3f(rippleIntensity * 0.8, rippleIntensity * 0.85, rippleIntensity);\n    }\n  }\n\n  return vec4f(hdr, 1.0);\n}\n",
            depthWrite: true,
            depthCompare: "less"
          });
          const _0x2d4d3b = be(_0x2cc8ca, _0x1614a7, _0xc01810, {
            vertex: "\n" + ye + "\n\nstruct FlowerOutput {\n  @builtin(position) position: vec4f,\n  @location(0) petalT: f32,\n  @location(1) normalX: f32,\n  @location(2) normalY: f32,\n  @location(3) normalZ: f32,\n  @location(4) seed: f32,\n  @location(5) isCenter: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n@group(0) @binding(1) var<storage, read> flowerPositions: array<vec4f>;\n\n@vertex\nfn main(@builtin(vertex_index) vertexIndex: u32) -> FlowerOutput {\n  var output: FlowerOutput;\n\n  let vertsPerFlower = 150u;\n  let flowerIdx = vertexIndex / vertsPerFlower;\n  let localVert = vertexIndex % vertsPerFlower;\n\n  let flowerData = flowerPositions[flowerIdx];\n  let col = flowerData.x;\n  let row = flowerData.y;\n  let topY = flowerData.z;\n  let rawSeed = flowerData.w;\n\n  let isLeaf = step(1.0, rawSeed);\n  let seed = rawSeed - isLeaf;\n  output.seed = rawSeed;\n\n  let progress = uniforms.progress;\n\n  let vis = smoothstep(0.0, 0.6, 1.0 - progress);\n  if (vis < 0.01) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let blockSize = f32(" + ke + ");\n  let gridSize = uniforms.gridSize;\n  let halfGrid = gridSize * blockSize * 0.5;\n\n  // In summer, cull ~60% of low-lying ground flowers\n  let season = uniforms.season;\n  let groundThreshold = blockSize * gridSize * 0.22;\n  if (season > 0.5 && season < 1.5 && topY < groundThreshold && fract(seed * 7.13) < 0.82) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let centerX = col * blockSize - halfGrid;\n  let centerY = topY;\n  let centerZ = row * blockSize - halfGrid;\n\n  let time = uniforms.time;\n  let isGroundPetal = step(topY, blockSize * 2.5);\n  let windFactor = (1.0 - isGroundPetal) * vis;\n  let windBase = sin(time * 0.45 + col * 0.25 + row * 0.15) * 0.028;\n  let windTurb = sin(time * 1.1 + col * 0.8 + row * 0.6) * 0.008;\n  let swayX = (windBase + windTurb) * windFactor;\n  let swayZ = sin(time * 0.35 + col * 0.15 + row * 0.25) * 0.018 * windFactor;\n\n  let baseScale = blockSize * (0.7 + seed * 0.3) * vis;\n  let flowerScale = mix(baseScale, baseScale * 0.9, isLeaf);\n  let petalLength = mix(flowerScale * 0.85, flowerScale * 1.3, isLeaf);\n  let petalWidth = mix(flowerScale * 0.38, flowerScale * 0.18, isLeaf);\n  let curlHeight = mix(blockSize * 0.18, blockSize * 0.08, isLeaf) * vis;\n  let centerRadius = mix(blockSize * 0.12, blockSize * 0.04, isLeaf) * vis;\n\n  let baseRotation = seed * 6.28318;\n\n  let tiltAngle = (seed * 0.25 + 0.05) * (1.0 - isLeaf * 0.5);\n  let tiltDir = seed * 6.28318 * 3.17;\n  let tiltCos = cos(tiltAngle);\n  let tiltSin = sin(tiltAngle);\n  let tiltAxisX = cos(tiltDir);\n  let tiltAxisZ = sin(tiltDir);\n\n  var localPos = vec3f(0.0);\n  var normal = vec3f(0.0, 1.0, 0.0);\n  output.isCenter = 0.0;\n  output.petalT = 0.0;\n\n  if (localVert < 120u) {\n    let petalIdx = localVert / 24u;\n    let segVert = localVert % 24u;\n    let segIdx = segVert / 6u;\n    let triVert = segVert % 6u;\n\n    let petalAngle = f32(petalIdx) * 1.25664 + baseRotation;\n    let cosA = cos(petalAngle);\n    let sinA = sin(petalAngle);\n\n    var petalScale = 1.0;\n    if (isLeaf > 0.5 && petalIdx >= 3u) {\n      petalScale = 0.0;\n    }\n\n    var rowIdx: u32;\n    var side: f32;\n    if (triVert == 0u) { rowIdx = segIdx;     side = -1.0; }\n    else if (triVert == 1u) { rowIdx = segIdx;     side =  1.0; }\n    else if (triVert == 2u) { rowIdx = segIdx + 1u; side = -1.0; }\n    else if (triVert == 3u) { rowIdx = segIdx + 1u; side = -1.0; }\n    else if (triVert == 4u) { rowIdx = segIdx;     side =  1.0; }\n    else { rowIdx = segIdx + 1u; side =  1.0; }\n\n    let t = f32(rowIdx) * 0.25;\n    output.petalT = t;\n\n    let dist = t * petalLength * petalScale;\n    let hw = petalWidth * sin(t * 3.14159) * sqrt(1.0 - t * 0.3) * petalScale;\n    let curl = curlHeight * 4.0 * t * (1.0 - t);\n\n    let alongX = dist * cosA;\n    let alongZ = dist * sinA;\n    let perpX = side * hw * (-sinA);\n    let perpZ = side * hw * cosA;\n\n    localPos = vec3f(\n      centerX + alongX + perpX + swayX,\n      centerY + curl,\n      centerZ + alongZ + perpZ + swayZ,\n    );\n\n    let curlSlope = curlHeight * 4.0 * (1.0 - 2.0 * t);\n    normal = normalize(vec3f(\n      -curlSlope * cosA + side * 0.2 * sinA,\n      1.0,\n      -curlSlope * sinA - side * 0.2 * cosA,\n    ));\n  } else {\n    output.isCenter = 1.0;\n    let diskVert = localVert - 120u;\n    let triIdx = diskVert / 3u;\n    let triV = diskVert % 3u;\n\n    let centerElevation = curlHeight * 0.8;\n\n    if (triV == 0u) {\n      localPos = vec3f(centerX + swayX, centerY + centerElevation, centerZ + swayZ);\n      normal = vec3f(0.0, 1.0, 0.0);\n    } else {\n      let angleIdx = select(triIdx, triIdx + 1u, triV == 2u);\n      let angle = f32(angleIdx) * 0.62832 + baseRotation;\n      localPos = vec3f(\n        centerX + cos(angle) * centerRadius + swayX,\n        centerY + centerElevation * 0.9,\n        centerZ + sin(angle) * centerRadius + swayZ,\n      );\n      normal = vec3f(0.0, 1.0, 0.0);\n    }\n  }\n\n  // Apply tilt (Rodrigues rotation)\n  let offX = localPos.x - centerX - swayX;\n  let offY = localPos.y - centerY;\n  let offZ = localPos.z - centerZ - swayZ;\n\n  let dotAO = tiltAxisX * offX + tiltAxisZ * offZ;\n  let crossX = -tiltAxisZ * offY;\n  let crossY = tiltAxisZ * offX - tiltAxisX * offZ;\n  let crossZ = tiltAxisX * offY;\n\n  let rotX = offX * tiltCos + crossX * tiltSin + tiltAxisX * dotAO * (1.0 - tiltCos);\n  let rotY = offY * tiltCos + crossY * tiltSin;\n  let rotZ = offZ * tiltCos + crossZ * tiltSin + tiltAxisZ * dotAO * (1.0 - tiltCos);\n\n  localPos = vec3f(\n    centerX + swayX + rotX,\n    centerY + rotY,\n    centerZ + swayZ + rotZ,\n  );\n\n  // Also rotate normal\n  let nDotA = tiltAxisX * normal.x + tiltAxisZ * normal.z;\n  let nCrossX = -tiltAxisZ * normal.y;\n  let nCrossY = tiltAxisZ * normal.x - tiltAxisX * normal.z;\n  let nCrossZ = tiltAxisX * normal.y;\n  normal = normalize(vec3f(\n    normal.x * tiltCos + nCrossX * tiltSin + tiltAxisX * nDotA * (1.0 - tiltCos),\n    normal.y * tiltCos + nCrossY * tiltSin,\n    normal.z * tiltCos + nCrossZ * tiltSin + tiltAxisZ * nDotA * (1.0 - tiltCos),\n  ));\n\n  // Scale toward center for 2D transition\n  localPos = vec3f(\n    centerX + swayX + (localPos.x - centerX - swayX) * vis,\n    centerY + (localPos.y - centerY) * vis,\n    centerZ + swayZ + (localPos.z - centerZ - swayZ) * vis,\n  );\n\n  output.normalX = normal.x;\n  output.normalY = normal.y;\n  output.normalZ = normal.z;\n\n  " + we() + "\n  \n  output.position = vec4f(\n    (ry_x + xOffsetScene) * scaleX,\n    (rx_y + yOffsetScene) * scaleY,\n    rx_z * 0.01 + 0.5,\n    1.0\n  );\n\n  return output;\n}\n",
            fragment: "\n" + ye + "\n\nstruct FlowerInput {\n  @location(0) petalT: f32,\n  @location(1) normalX: f32,\n  @location(2) normalY: f32,\n  @location(3) normalZ: f32,\n  @location(4) seed: f32,\n  @location(5) isCenter: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n" + xe + "\n\n@fragment\nfn main(input: FlowerInput) -> @location(0) vec4f {\n  let N = normalize(vec3f(input.normalX, input.normalY, input.normalZ));\n  let t = input.petalT;\n  let rawSeed = input.seed;\n  let origIsLeaf = step(1.0, rawSeed);\n  let seed = rawSeed - origIsLeaf;\n\n  let season = uniforms.season;\n\n  let leafChance = fract(seed * 4.37);\n  var isLeaf = origIsLeaf;\n  let isGroundFlower = step(input.petalT, 0.01) * (1.0 - origIsLeaf);\n\n  if (season > 0.5 && season < 1.5) {\n    isLeaf = 1.0;\n  } else if (season > 1.5 && season < 2.5) {\n    isLeaf = 1.0;\n    if (leafChance < 0.40) { discard; }\n  } else if (season > 2.5) {\n    isLeaf = 1.0;\n    if (leafChance < 0.15) { discard; }\n  }\n\n  var leafDark   = vec3f(0.25, 0.40, 0.22);\n  var leafMedium = vec3f(0.40, 0.55, 0.30);\n  var leafLight  = vec3f(0.55, 0.68, 0.38);\n  var leafOlive  = vec3f(0.48, 0.52, 0.28);\n\n  if (season > 0.5 && season < 1.5) {\n    leafDark   = vec3f(0.03, 0.12, 0.01);\n    leafMedium = vec3f(0.06, 0.20, 0.02);\n    leafLight  = vec3f(0.12, 0.28, 0.03);\n    leafOlive  = vec3f(0.08, 0.18, 0.02);\n  } else if (season > 1.5 && season < 2.5) {\n    leafDark   = vec3f(0.42, 0.12, 0.05);\n    leafMedium = vec3f(0.58, 0.21, 0.07);\n    leafLight  = vec3f(0.70, 0.34, 0.09);\n    leafOlive  = vec3f(0.62, 0.40, 0.07);\n  } else if (season > 2.5) {\n    // Deep winter pine needle greens with rich depth\n    leafDark   = vec3f(0.08, 0.18, 0.14);\n    leafMedium = vec3f(0.16, 0.30, 0.24);\n    leafLight  = vec3f(0.26, 0.44, 0.36);\n    leafOlive  = vec3f(0.20, 0.36, 0.28);\n  }\n\n  var shadeDeep   = vec3f(0.85, 0.22, 0.38);\n  var shadeMedium = vec3f(0.92, 0.40, 0.52);\n  var shadeLight  = vec3f(0.96, 0.58, 0.66);\n  var shadePale   = vec3f(0.98, 0.75, 0.80);\n  var shadeBlush  = vec3f(0.97, 0.65, 0.72);\n  var shadeWhite  = vec3f(0.99, 0.88, 0.90);\n  var stamenGold  = vec3f(0.92, 0.78, 0.35);\n\n  if (season > 0.5 && season < 1.5) {\n    shadeDeep   = vec3f(0.88, 0.90, 0.82);\n    shadeMedium = vec3f(0.92, 0.93, 0.85);\n    shadeLight  = vec3f(0.95, 0.95, 0.88);\n    shadePale   = vec3f(0.96, 0.96, 0.92);\n    shadeBlush  = vec3f(0.93, 0.94, 0.86);\n    shadeWhite  = vec3f(0.97, 0.97, 0.94);\n    stamenGold  = vec3f(0.82, 0.78, 0.35);\n  } else if (season > 1.5 && season < 2.5) {\n    shadeDeep   = vec3f(0.52, 0.08, 0.03);\n    shadeMedium = vec3f(0.64, 0.18, 0.05);\n    shadeLight  = vec3f(0.72, 0.32, 0.07);\n    shadePale   = vec3f(0.78, 0.46, 0.12);\n    shadeBlush  = vec3f(0.68, 0.25, 0.07);\n    shadeWhite  = vec3f(0.80, 0.58, 0.20);\n    stamenGold  = vec3f(0.62, 0.42, 0.08);\n  } else if (season > 2.5) {\n    // Winter Red Holly / Plum Blossom accent dots\n    shadeDeep   = vec3f(0.70, 0.12, 0.16);\n    shadeMedium = vec3f(0.84, 0.18, 0.24);\n    shadeLight  = vec3f(0.92, 0.28, 0.32);\n    shadePale   = vec3f(0.95, 0.42, 0.46);\n    shadeBlush  = vec3f(0.88, 0.22, 0.26);\n    shadeWhite  = vec3f(0.98, 0.60, 0.64);\n    stamenGold  = vec3f(0.88, 0.75, 0.25);\n  }\n\n  var baseColor = vec3f(0.0);\n\n  if (isLeaf > 0.5) {\n    let leafTier = fract(seed * 5.17);\n    var leafBase: vec3f;\n    var leafTip: vec3f;\n    if (leafTier < 0.35) { leafBase = leafDark; leafTip = leafMedium; }\n    else if (leafTier < 0.6) { leafBase = leafMedium; leafTip = leafLight; }\n    else if (leafTier < 0.85) { leafBase = leafOlive; leafTip = leafLight; }\n    else { leafBase = leafDark; leafTip = leafOlive; }\n    baseColor = mix(leafBase, leafTip, t);\n\n    // In Winter: Top surfaces receive beautiful pure snow caps (雪盖松针)\n    if (season > 2.5) {\n      let snowCap = smoothstep(0.15, 0.75, N.y) * (0.65 + fract(seed * 7.13) * 0.35);\n      let snowCol = vec3f(0.93, 0.95, 0.98);\n      baseColor = mix(baseColor, snowCol, snowCap * 0.82);\n      // Frost rim on leaf edge\n      baseColor = mix(baseColor, vec3f(0.86, 0.92, 0.98), t * 0.35);\n    }\n  } else if (input.isCenter > 0.5) {\n    let goldVar = fract(seed * 13.3) * 0.15;\n    let goldColor = stamenGold * (0.9 + goldVar);\n    let centerLeaf = mix(leafDark, leafMedium, fract(seed * 5.17));\n    baseColor = mix(goldColor, centerLeaf, min(season, 1.0));\n    if (season > 2.5) {\n      baseColor = mix(stamenGold, vec3f(0.92, 0.95, 0.98), 0.35);\n    }\n  } else {\n    if (season > 0.5 && season < 2.5) {\n      let leafTier2 = fract(seed * 8.13);\n      var lBase: vec3f;\n      var lTip: vec3f;\n      if (leafTier2 < 0.3) { lBase = leafDark; lTip = leafMedium; }\n      else if (leafTier2 < 0.6) { lBase = leafMedium; lTip = leafLight; }\n      else if (leafTier2 < 0.85) { lBase = leafOlive; lTip = leafLight; }\n      else { lBase = leafDark; lTip = leafOlive; }\n      baseColor = mix(lBase, lTip, t);\n    } else if (season > 2.5) {\n      // Winter snow blooms\n      let tierW = fract(seed * 7.31);\n      var pBase = vec3f(0.12, 0.24, 0.18);\n      var pTip = vec3f(0.92, 0.95, 0.98);\n      baseColor = mix(pBase, pTip, smoothstep(0.1, 0.8, t + N.y * 0.4));\n    } else {\n      let tier = fract(seed * 7.31);\n      var petalBase: vec3f;\n      var petalTip: vec3f;\n      if (tier < 0.2) { petalBase = shadeDeep; petalTip = shadeMedium; }\n      else if (tier < 0.35) { petalBase = shadeMedium; petalTip = shadeLight; }\n      else if (tier < 0.50) { petalBase = shadeLight; petalTip = shadePale; }\n      else if (tier < 0.65) { petalBase = shadeBlush; petalTip = shadePale; }\n      else if (tier < 0.80) { petalBase = shadePale; petalTip = shadeWhite; }\n      else { petalBase = shadeDeep; petalTip = shadeBlush; }\n      baseColor = mix(petalBase, petalTip, t);\n\n      let veinT = abs(t - 0.5) * 2.0;\n      let veinDarken = 1.0 - (1.0 - veinT) * 0.08;\n      baseColor = baseColor * veinDarken;\n    }\n  }\n\n  let customStrength = uniforms.customStrength;\n  if (customStrength > 0.01) {\n    let customCol = vec3f(uniforms.customR, uniforms.customG, uniforms.customB);\n    let luma = dot(baseColor, vec3f(0.299, 0.587, 0.114));\n    let baseLuma = dot(customCol, vec3f(0.299, 0.587, 0.114));\n    let lumaDelta = luma - 0.5;\n    let tinted = customCol * (0.7 + lumaDelta * 1.2) + vec3f(lumaDelta * 0.15);\n    baseColor = mix(baseColor, tinted, customStrength);\n  }\n\n  const sunDir = vec3f(-0.405616, 0.861934, -0.304212);\n  let sunColor = vec3f(1.20, 1.20, 1.20);\n  let ambient = vec3f(0.28, 0.28, 0.30);\n  let NdotL = max(dot(N, sunDir), 0.0);\n\n  let NdotLBack = max(dot(-N, sunDir), 0.0);\n  let sssColor = mix(vec3f(1.0, 0.55, 0.65), vec3f(0.6, 0.8, 0.4), isLeaf);\n  let subsurface = NdotLBack * 0.22 * sssColor;\n\n  let skyFill = vec3f(0.90, 0.85, 0.88);\n  let skyContrib = max(N.y, 0.0) * 0.12 * skyFill;\n\n  let depthDarken = mix(0.92, 1.0, fract(seed * 11.3));\n  let undersideDarken = mix(0.55, 1.0, max(N.y, 0.0)) * depthDarken;\n\n  const viewDir = vec3f(0.398015, 0.597022, 0.696526);\n  let rimDot = 1.0 - max(dot(N, viewDir), 0.0);\n  let rim = pow(rimDot, 3.0) * 0.10 * vec3f(1.0, 0.85, 0.88);\n\n  let lit = baseColor * undersideDarken * (ambient + sunColor * NdotL * 0.88) + subsurface + skyContrib + rim;\n\n  let hdr = acesFilm(lit * 1.05);\n  var ldr = pow(hdr, vec3f(1.0 / 2.2));\n\n  let gray = dot(ldr, vec3f(0.299, 0.587, 0.114));\n  ldr = mix(vec3f(gray), ldr, 1.9);\n\n  if (season < 0.5 && isLeaf < 0.5) {\n    let qrDarken = uniforms.progress * uniforms.progress;\n    let brightness = dot(ldr, vec3f(0.299, 0.587, 0.114));\n    let extraDark = mix(0.55, 0.42, smoothstep(0.5, 0.8, brightness) * customStrength);\n    ldr = ldr * mix(1.0, extraDark, qrDarken);\n  }\n\n  return vec4f(ldr, 1.0);\n}\n",
            depthWrite: true,
            depthCompare: "less"
          });
          let _0x1a172b = null;
          try {
            _0x1a172b = be(_0x2cc8ca, _0x1614a7, _0xc01810, {
              vertex: "\n" + ye + "\n\nstruct BranchOutput {\n  @builtin(position) position: vec4f,\n  @location(0) normalX: f32,\n  @location(1) normalY: f32,\n  @location(2) normalZ: f32,\n  @location(3) depth: f32,\n  @location(4) vSeed: f32,\n  @location(5) ringT: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n@group(0) @binding(1) var<storage, read> branchData: array<vec4f>;\n\nconst VERTS_PER_SEG: u32 = 48u;\nconst RADIAL: u32 = 8u;\nconst PI: f32 = 3.14159265;\n\n@vertex\nfn main(@builtin(vertex_index) vertexIndex: u32) -> BranchOutput {\n  var output: BranchOutput;\n\n  let segIdx = vertexIndex / VERTS_PER_SEG;\n  let localVert = vertexIndex % VERTS_PER_SEG;\n\n  let segCount = u32(uniforms.blockCount);\n  if (segIdx >= segCount) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let startData = branchData[segIdx * 3u + 0u];\n  let endData   = branchData[segIdx * 3u + 1u];\n  let segMeta   = branchData[segIdx * 3u + 2u];\n\n  let startPos = startData.xyz;\n  let startR   = startData.w;\n  let endPos   = endData.xyz;\n  let endR     = endData.w;\n  let depth    = segMeta.x;\n  let seed     = segMeta.y;\n\n  output.depth = depth;\n  output.vSeed = seed;\n\n  let progress = uniforms.progress;\n  let branchVis = smoothstep(0.0, 0.4, 1.0 - progress);\n  if (branchVis < 0.01) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let quadIdx = localVert / 6u;\n  let triVert = localVert % 6u;\n\n  let angle0 = f32(quadIdx) / f32(RADIAL) * 2.0 * PI;\n  let angle1 = f32(quadIdx + 1u) / f32(RADIAL) * 2.0 * PI;\n\n  var ringT: f32;\n  var angle: f32;\n  if (triVert == 0u) { ringT = 0.0; angle = angle0; }\n  else if (triVert == 1u) { ringT = 0.0; angle = angle1; }\n  else if (triVert == 2u) { ringT = 1.0; angle = angle0; }\n  else if (triVert == 3u) { ringT = 1.0; angle = angle0; }\n  else if (triVert == 4u) { ringT = 0.0; angle = angle1; }\n  else { ringT = 1.0; angle = angle1; }\n\n  output.ringT = ringT;\n\n  let pos = mix(startPos, endPos, ringT);\n  let radius = mix(startR, endR, ringT) * branchVis;\n\n  let dir = normalize(endPos - startPos);\n  var refUp = vec3f(0.0, 1.0, 0.0);\n  if (abs(dot(dir, refUp)) > 0.95) {\n    refUp = vec3f(1.0, 0.0, 0.0);\n  }\n  let right = normalize(cross(dir, refUp));\n  let up = normalize(cross(right, dir));\n\n  let time = uniforms.time;\n  let windAmount = min(depth / 4.0, 1.0) * 0.016 * branchVis;\n  let windBase = sin(time * 0.45 + pos.x * 15.0 + pos.z * 10.0) * windAmount;\n  let windTurb = sin(time * 1.1 + pos.x * 40.0 + pos.z * 30.0) * windAmount * 0.25;\n  let windOffX = windBase + windTurb;\n  let windOffZ = sin(time * 0.35 + pos.z * 12.0 + pos.x * 8.0) * windAmount * 0.6;\n  let windedPos = pos + vec3f(windOffX, 0.0, windOffZ);\n\n  let localPos = windedPos + right * cos(angle) * radius + up * sin(angle) * radius;\n\n  let normal = normalize(right * cos(angle) + up * sin(angle));\n  output.normalX = normal.x;\n  output.normalY = normal.y;\n  output.normalZ = normal.z;\n\n  " + we() + "\n  \n  output.position = vec4f(\n    (ry_x + xOffsetScene) * scaleX,\n    (rx_y + yOffsetScene) * scaleY,\n    rx_z * 0.01 + 0.5,\n    1.0\n  );\n\n\n  return output;\n}\n",
              fragment: "\n" + ye + "\n\nstruct BranchInput {\n  @location(0) normalX: f32,\n  @location(1) normalY: f32,\n  @location(2) normalZ: f32,\n  @location(3) depth: f32,\n  @location(4) vSeed: f32,\n  @location(5) ringT: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n" + xe + "\n\n@fragment\nfn main(input: BranchInput) -> @location(0) vec4f {\n  let N = normalize(vec3f(input.normalX, input.normalY, input.normalZ));\n  let depth = input.depth;\n  let seed = input.vSeed;\n  let t = input.ringT;\n\n  let barkBase  = vec3f(0.28, 0.16, 0.10);\n  let barkLight = vec3f(0.40, 0.26, 0.18);\n  let barkDark  = vec3f(0.16, 0.09, 0.05);\n  let barkHighlight = vec3f(0.50, 0.34, 0.24);\n\n  let depthT = min(depth / 5.0, 1.0);\n  var bark = mix(barkBase, barkLight, depthT * 0.5);\n  bark = mix(bark, barkHighlight, depthT * depthT * 0.2);\n\n  let noise1 = fract(sin(seed * 43.7 + depth * 17.3) * 43758.5);\n  let noise2 = fract(sin(seed * 73.1 + depth * 31.1 + 127.1) * 43758.5);\n\n  let grooveAngle = fract(sin(seed * 127.1 + t * 31.1) * 43758.5) * 6.28;\n  let groove1 = sin(grooveAngle * 8.0 + noise1 * 3.0) * 0.5 + 0.5;\n  let groove2 = sin(grooveAngle * 14.0 + noise2 * 5.0 + 1.7) * 0.5 + 0.5;\n  let groove3 = sin(grooveAngle * 22.0 + noise1 * 7.0) * 0.5 + 0.5;\n  let grooveEffect = (groove1 * 0.5 + groove2 * 0.3 + groove3 * 0.2) * 0.18 + 0.82;\n\n  let ring = sin(t * 18.0 + noise2 * 6.0) * 0.07 + 0.93;\n\n  let knotNoise = sin(seed * 47.3 + t * 13.0 + noise1 * 8.0);\n  let knot = smoothstep(0.88, 0.95, knotNoise) * 0.10;\n\n  let colorShift = (noise1 - 0.5) * 0.12;\n  bark = bark * (1.0 + colorShift) * grooveEffect * ring - knot;\n\n  const sunDir = vec3f(-0.405616, 0.861934, -0.304212);\n  let sunCol = vec3f(1.20, 1.20, 1.20);\n  let ambient = vec3f(0.25, 0.25, 0.28);\n  let NdotL = max(dot(N, sunDir), 0.0);\n\n  let NdotLBack = max(dot(-N, sunDir), 0.0);\n  let sss = NdotLBack * depthT * 0.06 * vec3f(0.6, 0.3, 0.2);\n\n  let skyFill = vec3f(0.85, 0.80, 0.90);\n  let skyContrib = max(N.y, 0.0) * 0.08 * skyFill;\n\n  let ao = 0.75 + depthT * 0.25;\n\n  let lit = bark * (ambient + sunCol * NdotL * 0.82) * ao + sss + skyContrib;\n\n  let hdr = acesFilm(lit * 1.05);\n  var ldr = pow(hdr, vec3f(1.0 / 2.2));\n\n  let gray = dot(ldr, vec3f(0.299, 0.587, 0.114));\n  ldr = mix(vec3f(gray), ldr, 1.25);\n\n  return vec4f(ldr, 1.0);\n}\n",
              depthWrite: true,
              depthCompare: "less"
            });
          } catch (_0x351bc4) {
            console.error("Branch pipeline failed (non-fatal):", _0x351bc4);
          }
          let _0x2f7da1 = null;
          try {
            _0x2f7da1 = be(_0x2cc8ca, _0x1614a7, _0xc01810, {
              vertex: "\n" + ye + "\n\nstruct GrassOutput {\n  @builtin(position) position: vec4f,\n  @location(0) greenT: f32,\n  @location(1) normalY: f32,\n  @location(2) seed: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n@group(0) @binding(1) var<storage, read> grassData: array<vec4f>;\n\nconst PI: f32 = 3.14159265;\n\n@vertex\nfn main(@builtin(vertex_index) vertexIndex: u32) -> GrassOutput {\n  var output: GrassOutput;\n\n  let bladeIdx = vertexIndex / 3u;\n  let vertIdx = vertexIndex % 3u;\n\n  let grassCount = u32(uniforms.blockCount);\n  if (bladeIdx >= grassCount) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let progress = uniforms.progress;\n  let vis = smoothstep(0.0, 0.3, 1.0 - progress);\n  if (vis < 0.01) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let data = grassData[bladeIdx];\n  let col = data.x;\n  let row = data.y;\n  let seed = data.z;\n  let bladeHeight = data.w * vis;\n\n  output.seed = seed;\n\n  let blockSize = f32(" + ke + ");\n  let gridSize = uniforms.gridSize;\n  let halfGrid = gridSize * blockSize * 0.5;\n\n  let baseX = col * blockSize - halfGrid;\n  let baseY = 0.0;\n  let baseZ = row * blockSize - halfGrid;\n\n  let angle = seed * PI * 2.0;\n  let cosA = cos(angle);\n  let sinA = sin(angle);\n\n  let halfWidth = blockSize * 0.22;\n\n  var localPos = vec3f(0.0);\n\n  let tiltX = (seed - 0.5) * 0.4;\n  let tiltZ = (fract(seed * 7.13) - 0.5) * 0.4;\n  let time = uniforms.time;\n  let windBase = sin(time * 0.45 + col * 0.25 + row * 0.15) * 0.02;\n  let windTurb = sin(time * 1.1 + col * 0.8 + row * 0.6) * 0.005;\n  let windX = windBase + windTurb;\n  let windZ = sin(time * 0.35 + col * 0.15 + row * 0.25) * 0.012;\n  let tipOffX = (tiltX + windX) * bladeHeight * 4.0;\n  let tipOffZ = (tiltZ + windZ) * bladeHeight * 4.0;\n\n  let yLift = blockSize * 1.0;\n\n  if (vertIdx == 0u) {\n    localPos = vec3f(baseX - halfWidth * cosA, baseY + yLift, baseZ - halfWidth * sinA);\n    output.greenT = 0.0;\n    output.normalY = 0.3;\n  } else if (vertIdx == 1u) {\n    localPos = vec3f(baseX + halfWidth * cosA, baseY + yLift, baseZ + halfWidth * sinA);\n    output.greenT = 0.0;\n    output.normalY = 0.3;\n  } else {\n    let curlDroop = bladeHeight * seed * 0.15;\n    localPos = vec3f(baseX + tipOffX, baseY + yLift + bladeHeight - curlDroop, baseZ + tipOffZ);\n    output.greenT = 1.0;\n    output.normalY = 0.9;\n  }\n\n  " + we() + "\n  \n  output.position = vec4f(\n    (ry_x + xOffsetScene) * scaleX,\n    (rx_y + yOffsetScene) * scaleY,\n    rx_z * 0.01 + 0.5,\n    1.0\n  );\n\n\n  return output;\n}\n",
              fragment: "\n" + ye + "\n\nstruct GrassInput {\n  @location(0) greenT: f32,\n  @location(1) normalY: f32,\n  @location(2) seed: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n" + xe + "\n\n@fragment\nfn main(input: GrassInput) -> @location(0) vec4f {\n  let season = uniforms.season;\n\n  var darkGreen  = vec3f(0.12, 0.32, 0.06);\n  var midGreen   = vec3f(0.22, 0.48, 0.12);\n  var lightGreen = vec3f(0.35, 0.58, 0.20);\n  var coralPink  = vec3f(0.65, 0.28, 0.30);\n  var dustyRose  = vec3f(0.55, 0.32, 0.28);\n  var mossGreen  = vec3f(0.30, 0.40, 0.15);\n  var yellowFlower = vec3f(0.75, 0.68, 0.20);\n  var whiteFlower = vec3f(0.88, 0.86, 0.78);\n  var lavender = vec3f(0.55, 0.42, 0.62);\n\n  if (season > 0.5 && season < 1.5) {\n    darkGreen  = vec3f(0.03, 0.16, 0.01);\n    midGreen   = vec3f(0.08, 0.28, 0.02);\n    lightGreen = vec3f(0.16, 0.38, 0.04);\n    mossGreen  = vec3f(0.10, 0.22, 0.02);\n    coralPink  = vec3f(0.12, 0.28, 0.03);\n    dustyRose  = vec3f(0.08, 0.22, 0.02);\n    yellowFlower = vec3f(0.44, 0.48, 0.10);\n    whiteFlower = vec3f(0.58, 0.64, 0.42);\n    lavender = vec3f(0.18, 0.30, 0.08);\n  } else if (season > 1.5 && season < 2.5) {\n    darkGreen  = vec3f(0.42, 0.24, 0.08);\n    midGreen   = vec3f(0.56, 0.32, 0.10);\n    lightGreen = vec3f(0.70, 0.42, 0.12);\n    mossGreen  = vec3f(0.50, 0.30, 0.08);\n    coralPink  = vec3f(0.62, 0.26, 0.10);\n    dustyRose  = vec3f(0.55, 0.28, 0.12);\n    yellowFlower = vec3f(0.76, 0.52, 0.14);\n    whiteFlower = vec3f(0.74, 0.62, 0.42);\n    lavender = vec3f(0.52, 0.32, 0.18);\n  } else if (season > 2.5) {\n    // Winter dormant golden reeds and frosty dried grass\n    darkGreen    = vec3f(0.35, 0.32, 0.25);\n    midGreen     = vec3f(0.48, 0.45, 0.36);\n    lightGreen   = vec3f(0.65, 0.62, 0.52);\n    mossGreen    = vec3f(0.40, 0.38, 0.30);\n    coralPink    = vec3f(0.60, 0.58, 0.52);\n    dustyRose    = vec3f(0.52, 0.50, 0.44);\n    yellowFlower = vec3f(0.78, 0.18, 0.22); // Winter Holly Red Berry\n    whiteFlower  = vec3f(0.92, 0.94, 0.96); // Snow frost dots\n    lavender     = vec3f(0.55, 0.54, 0.50);\n  }\n\n  let tier = fract(input.seed * 7.31);\n  var baseColor: vec3f;\n  var tipColor: vec3f;\n  if (tier < 0.22) { baseColor = darkGreen; tipColor = midGreen; }\n  else if (tier < 0.42) { baseColor = midGreen; tipColor = lightGreen; }\n  else if (tier < 0.55) { baseColor = mossGreen; tipColor = lightGreen; }\n  else if (tier < 0.68) { baseColor = dustyRose; tipColor = coralPink; }\n  else if (tier < 0.76) { baseColor = coralPink; tipColor = vec3f(0.72, 0.35, 0.35); }\n  else if (tier < 0.84) { baseColor = midGreen; tipColor = yellowFlower; }\n  else if (tier < 0.92) { baseColor = mossGreen; tipColor = whiteFlower; }\n  else { baseColor = dustyRose; tipColor = lavender; }\n\n  var color = mix(baseColor, tipColor, input.greenT);\n  if (season > 2.5) {\n    // Frost tip highlight\n    color = mix(color, vec3f(0.90, 0.93, 0.96), input.greenT * 0.45);\n  }\n\n  const sunDir = vec3f(-0.405616, 0.861934, -0.304212);\n  let N = normalize(vec3f(0.0, input.normalY, 0.3));\n  let NdotL = max(dot(N, sunDir), 0.0);\n  let ambient = vec3f(0.22, 0.24, 0.18);\n  let sunCol = vec3f(1.20, 1.20, 1.20);\n\n  let lit = color * (ambient + sunCol * NdotL * 0.85);\n\n  let hdr = acesFilm(lit * 1.1);\n  var ldr = pow(hdr, vec3f(1.0 / 2.2));\n\n  let gray = dot(ldr, vec3f(0.299, 0.587, 0.114));\n  ldr = mix(vec3f(gray), ldr, 1.6);\n\n  return vec4f(ldr, 1.0);\n}\n",
              depthWrite: true,
              depthCompare: "less"
            });
          } catch (_0x33b16b) {
            console.error("Grass pipeline failed (non-fatal):", _0x33b16b);
          }
          let _0x72f378 = null;
          try {
            _0x72f378 = be(_0x2cc8ca, _0x1614a7, _0xc01810, {
              vertex: "\n" + ye + "\n\nstruct FlowerOutput {\n  @builtin(position) position: vec4f,\n  @location(0) petalT: f32,\n  @location(1) normalX: f32,\n  @location(2) normalY: f32,\n  @location(3) normalZ: f32,\n  @location(4) seed: f32,\n  @location(5) isCenter: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n@group(0) @binding(1) var<storage, read> petalData: array<vec4f>;\n\nconst PI: f32 = 3.14159265;\n\n@vertex\nfn main(@builtin(vertex_index) vertexIndex: u32) -> FlowerOutput {\n  var output: FlowerOutput;\n\n  let vertsPerFlower = 150u;\n  let flowerIdx = vertexIndex / vertsPerFlower;\n  let localVert = vertexIndex % vertsPerFlower;\n\n  let petalCount = u32(uniforms.blockCount);\n  if (flowerIdx >= petalCount) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let progress = uniforms.progress;\n  let vis = smoothstep(0.0, 0.4, 1.0 - progress);\n  if (vis < 0.01) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let data = petalData[flowerIdx];\n  let col = data.x;\n  let row = data.y;\n  let topY = data.z;\n  let seed = data.w;\n  output.seed = seed;\n\n  let blockSize = f32(" + ke + ");\n  let gridSize = uniforms.gridSize;\n  let halfGrid = gridSize * blockSize * 0.5;\n  let time = uniforms.time;\n\n  let cyclePeriod = 8.0 + seed * 6.0;\n  let phaseOffset = seed * 100.0;\n  let rawCycle = (time + phaseOffset) / cyclePeriod;\n  let cycleT = fract(rawCycle);\n\n  let fadeIn = smoothstep(0.0, 0.05, cycleT);\n  let fadeOut = 1.0 - smoothstep(0.95, 1.0, cycleT);\n  let fallVis = fadeIn * fadeOut * vis;\n\n  if (fallVis < 0.01) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let fallT = cycleT;\n  let groundY = blockSize * 1.5;\n  let fallHeight = mix(topY, groundY, fallT);\n\n  let originX = col * blockSize - halfGrid;\n  let originZ = row * blockSize - halfGrid;\n\n  let driftX = sin(time * 0.45 + seed * 5.0) * 0.045 * fallT\n             + sin(time * 1.1 + seed * 12.0) * 0.012 * fallT;\n  let driftZ = sin(time * 0.35 + seed * 8.0) * 0.03 * fallT\n             + cos(time * 0.8 + seed * 3.0) * 0.01 * fallT;\n\n  // Burst effect on toggle\n  let burstAge = time - uniforms.burstTime;\n  let burstIntensity = smoothstep(2.5, 0.0, burstAge) * step(0.0, uniforms.burstTime);\n  let burstAngle = seed * 6.28318 * 3.0 + f32(flowerIdx) * 0.618 * 6.28318;\n  let burstRadius = burstIntensity * blockSize * gridSize * 0.25 * (0.4 + seed * 0.6);\n  let burstDx = cos(burstAngle) * burstRadius;\n  let burstDy = burstIntensity * burstIntensity * blockSize * gridSize * 0.12 * (seed * 0.5 + 0.3);\n  let burstDz = sin(burstAngle) * burstRadius;\n\n  let centerX = originX + driftX + burstDx;\n  let centerY = fallHeight + burstDy;\n  let centerZ = originZ + driftZ + burstDz;\n\n  let flowerScale = blockSize * (0.5 + seed * 0.3) * fallVis;\n  let petalLength = flowerScale * 0.85;\n  let petalWidth = flowerScale * 0.38;\n  let curlHeight = blockSize * 0.15 * fallVis;\n  let centerRadius = blockSize * 0.10 * fallVis;\n\n  let baseRotation = seed * 6.28318 + time * (0.8 + seed * 1.2);\n\n  let tiltAngle = 0.3 + fallT * 1.2 + sin(time * 0.9 + seed * 7.0) * 0.4;\n  let tiltDir = time * (0.5 + seed * 0.8) + seed * PI * 2.0;\n  let tiltCos = cos(tiltAngle);\n  let tiltSin = sin(tiltAngle);\n  let tiltAxisX = cos(tiltDir);\n  let tiltAxisZ = sin(tiltDir);\n\n  var localPos = vec3f(0.0);\n  var normal = vec3f(0.0, 1.0, 0.0);\n  output.isCenter = 0.0;\n  output.petalT = 0.0;\n\n  if (localVert < 120u) {\n    let petalIdx = localVert / 24u;\n    let segVert = localVert % 24u;\n    let segIdx = segVert / 6u;\n    let triVert = segVert % 6u;\n\n    let petalAngle = f32(petalIdx) * 1.25664 + baseRotation;\n    let cosA = cos(petalAngle);\n    let sinA = sin(petalAngle);\n\n    var rowIdx: u32;\n    var side: f32;\n    if (triVert == 0u) { rowIdx = segIdx;     side = -1.0; }\n    else if (triVert == 1u) { rowIdx = segIdx;     side =  1.0; }\n    else if (triVert == 2u) { rowIdx = segIdx + 1u; side = -1.0; }\n    else if (triVert == 3u) { rowIdx = segIdx + 1u; side = -1.0; }\n    else if (triVert == 4u) { rowIdx = segIdx;     side =  1.0; }\n    else { rowIdx = segIdx + 1u; side =  1.0; }\n\n    let t = f32(rowIdx) * 0.25;\n    output.petalT = t;\n\n    let dist = t * petalLength;\n    let hw = petalWidth * sin(t * 3.14159) * sqrt(1.0 - t * 0.3);\n    let curl = curlHeight * 4.0 * t * (1.0 - t);\n\n    let alongX = dist * cosA;\n    let alongZ = dist * sinA;\n    let perpX = side * hw * (-sinA);\n    let perpZ = side * hw * cosA;\n\n    localPos = vec3f(alongX + perpX, curl, alongZ + perpZ);\n\n    let curlSlope = curlHeight * 4.0 * (1.0 - 2.0 * t);\n    normal = normalize(vec3f(\n      -curlSlope * cosA + side * 0.2 * sinA,\n      1.0,\n      -curlSlope * sinA - side * 0.2 * cosA,\n    ));\n  } else {\n    output.isCenter = 1.0;\n    let diskVert = localVert - 120u;\n    let triIdx = diskVert / 3u;\n    let triV = diskVert % 3u;\n\n    let centerElevation = curlHeight * 0.8;\n\n    if (triV == 0u) {\n      localPos = vec3f(0.0, centerElevation, 0.0);\n      normal = vec3f(0.0, 1.0, 0.0);\n    } else {\n      let angleIdx = select(triIdx, triIdx + 1u, triV == 2u);\n      let diskAngle = f32(angleIdx) * 0.62832 + baseRotation;\n      localPos = vec3f(cos(diskAngle) * centerRadius, centerElevation * 0.9, sin(diskAngle) * centerRadius);\n      normal = vec3f(0.0, 1.0, 0.0);\n    }\n  }\n\n  // Apply tumbling tilt (Rodrigues rotation)\n  let dotAO = tiltAxisX * localPos.x + tiltAxisZ * localPos.z;\n  let crossX = -tiltAxisZ * localPos.y;\n  let crossY = tiltAxisZ * localPos.x - tiltAxisX * localPos.z;\n  let crossZ = tiltAxisX * localPos.y;\n\n  let rotX = localPos.x * tiltCos + crossX * tiltSin + tiltAxisX * dotAO * (1.0 - tiltCos);\n  let rotY = localPos.y * tiltCos + crossY * tiltSin;\n  let rotZ = localPos.z * tiltCos + crossZ * tiltSin + tiltAxisZ * dotAO * (1.0 - tiltCos);\n\n  localPos = vec3f(centerX + rotX, centerY + rotY, centerZ + rotZ);\n\n  let nDotA = tiltAxisX * normal.x + tiltAxisZ * normal.z;\n  let nCrossX = -tiltAxisZ * normal.y;\n  let nCrossY = tiltAxisZ * normal.x - tiltAxisX * normal.z;\n  let nCrossZ = tiltAxisX * normal.y;\n  normal = normalize(vec3f(\n    normal.x * tiltCos + nCrossX * tiltSin + tiltAxisX * nDotA * (1.0 - tiltCos),\n    normal.y * tiltCos + nCrossY * tiltSin,\n    normal.z * tiltCos + nCrossZ * tiltSin + tiltAxisZ * nDotA * (1.0 - tiltCos),\n  ));\n\n  output.normalX = normal.x;\n  output.normalY = normal.y;\n  output.normalZ = normal.z;\n\n  " + we() + "\n  \n  output.position = vec4f(\n    (ry_x + xOffsetScene) * scaleX,\n    (rx_y + yOffsetScene) * scaleY,\n    rx_z * 0.01 + 0.5,\n    1.0\n  );\n\n  return output;\n}\n",
              fragment: "\n" + ye + "\n\nstruct FlowerInput {\n  @location(0) petalT: f32,\n  @location(1) normalX: f32,\n  @location(2) normalY: f32,\n  @location(3) normalZ: f32,\n  @location(4) seed: f32,\n  @location(5) isCenter: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n" + xe + "\n\n@fragment\nfn main(input: FlowerInput) -> @location(0) vec4f {\n  let N = normalize(vec3f(input.normalX, input.normalY, input.normalZ));\n  let t = input.petalT;\n  let seed = input.seed;\n\n  let season = uniforms.season;\n\n  let fallChance = fract(seed * 4.37);\n  let springThreshold = mix(0.25, 0.15, uniforms.customStrength);\n  if (season < 0.5 && fallChance > springThreshold) { discard; }\n  if (season > 0.5 && season < 1.5) { discard; }\n  if (season > 2.5 && fallChance > 0.85) { discard; }\n\n  var shadeDeep    = vec3f(0.85, 0.22, 0.38);\n  var shadeMedium  = vec3f(0.92, 0.40, 0.52);\n  var shadeLight   = vec3f(0.96, 0.58, 0.66);\n  var shadePale    = vec3f(0.98, 0.75, 0.80);\n  var shadeBlush   = vec3f(0.97, 0.65, 0.72);\n  var shadeWhite   = vec3f(0.99, 0.88, 0.90);\n  var stamenGold   = vec3f(0.92, 0.78, 0.35);\n\n  if (season > 0.5 && season < 1.5) {\n    shadeDeep = vec3f(0.04, 0.14, 0.01); shadeMedium = vec3f(0.08, 0.24, 0.02);\n    shadeLight = vec3f(0.14, 0.34, 0.04); shadePale = vec3f(0.22, 0.40, 0.06);\n    shadeBlush = vec3f(0.10, 0.28, 0.03); shadeWhite = vec3f(0.28, 0.42, 0.08);\n    stamenGold = vec3f(0.34, 0.36, 0.06);\n  } else if (season > 1.5 && season < 2.5) {\n    shadeDeep = vec3f(0.62, 0.10, 0.04); shadeMedium = vec3f(0.75, 0.22, 0.06);\n    shadeLight = vec3f(0.85, 0.38, 0.08); shadePale = vec3f(0.90, 0.55, 0.15);\n    shadeBlush = vec3f(0.80, 0.30, 0.08); shadeWhite = vec3f(0.92, 0.68, 0.25);\n    stamenGold = vec3f(0.72, 0.50, 0.10);\n  } else if (season > 2.5) {\n    shadeDeep = vec3f(0.80, 0.88, 0.98); shadeMedium = vec3f(0.90, 0.95, 1.00);\n    shadeLight = vec3f(0.96, 0.98, 1.00); shadePale = vec3f(0.98, 0.99, 1.00);\n    shadeBlush = vec3f(0.90, 0.95, 1.00); shadeWhite = vec3f(1.00, 1.00, 1.00);\n    stamenGold = vec3f(0.75, 0.88, 1.00);\n  }\n\n  var baseColor = vec3f(0.0);\n\n  if (input.isCenter > 0.5) {\n    let goldVar = fract(seed * 13.3) * 0.15;\n    baseColor = stamenGold * (0.9 + goldVar);\n  } else {\n    let tier = fract(seed * 7.31);\n    var petalBase: vec3f;\n    var petalTip: vec3f;\n    if (tier < 0.2) { petalBase = shadeDeep; petalTip = shadeMedium; }\n    else if (tier < 0.35) { petalBase = shadeMedium; petalTip = shadeLight; }\n    else if (tier < 0.50) { petalBase = shadeLight; petalTip = shadePale; }\n    else if (tier < 0.65) { petalBase = shadeBlush; petalTip = shadePale; }\n    else if (tier < 0.80) { petalBase = shadePale; petalTip = shadeWhite; }\n    else { petalBase = shadeDeep; petalTip = shadeBlush; }\n    baseColor = mix(petalBase, petalTip, t);\n\n    let veinT = abs(t - 0.5) * 2.0;\n    let veinDarken = 1.0 - (1.0 - veinT) * 0.08;\n    baseColor = baseColor * veinDarken;\n  }\n\n  let customStrength = uniforms.customStrength;\n  if (customStrength > 0.01) {\n    let customCol = vec3f(uniforms.customR, uniforms.customG, uniforms.customB);\n    let luma = dot(baseColor, vec3f(0.299, 0.587, 0.114));\n    let lumaDelta = luma - 0.5;\n    let tinted = customCol * (0.7 + lumaDelta * 1.2) + vec3f(lumaDelta * 0.15);\n    baseColor = mix(baseColor, tinted, customStrength);\n  }\n\n  const sunDir = vec3f(-0.405616, 0.861934, -0.304212);\n  let sunColor = vec3f(1.20, 1.20, 1.20);\n  let ambient = vec3f(0.28, 0.28, 0.30);\n  let NdotL = max(dot(N, sunDir), 0.0);\n\n  let NdotLBack = max(dot(-N, sunDir), 0.0);\n  let sssColor = vec3f(1.0, 0.55, 0.65);\n  let subsurface = NdotLBack * 0.22 * sssColor;\n\n  let skyFill = vec3f(0.90, 0.85, 0.88);\n  let skyContrib = max(N.y, 0.0) * 0.12 * skyFill;\n\n  let undersideDarken = mix(0.55, 1.0, max(N.y, 0.0));\n\n  const viewDir = vec3f(0.398015, 0.597022, 0.696526);\n  let rimDot = 1.0 - max(dot(N, viewDir), 0.0);\n  let rim = pow(rimDot, 3.0) * 0.10 * vec3f(1.0, 0.85, 0.88);\n\n  let lit = baseColor * undersideDarken * (ambient + sunColor * NdotL * 0.88) + subsurface + skyContrib + rim;\n\n  let hdr = acesFilm(lit * 1.05);\n  var ldr = pow(hdr, vec3f(1.0 / 2.2));\n\n  let gray = dot(ldr, vec3f(0.299, 0.587, 0.114));\n  ldr = mix(vec3f(gray), ldr, 1.6);\n\n  return vec4f(ldr, 1.0);\n}\n",
              depthWrite: true,
              depthCompare: "less"
            });
          } catch (_0x45bc9e) {
            console.error("Falling petal pipeline failed (non-fatal):", _0x45bc9e);
          }
          let _0x3bc201 = null;
          try {
            _0x3bc201 = be(_0x2cc8ca, _0x1614a7, _0xc01810, {
              vertex: "\n" + ye + "\n\nstruct RainOutput {\n  @builtin(position) position: vec4f,\n  @location(0) alpha: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n@group(0) @binding(1) var<storage, read> rainData: array<vec4f>;\n\n@vertex\nfn main(@builtin(vertex_index) vertexIndex: u32) -> RainOutput {\n  var output: RainOutput;\n\n  let vertsPerDrop = 6u;\n  let dropIdx = vertexIndex / vertsPerDrop;\n  let localVert = vertexIndex % vertsPerDrop;\n\n  let count = u32(uniforms.blockCount);\n  if (dropIdx >= count) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let rainMode = uniforms.rainMode;\n  let progress = uniforms.progress;\n  // Hide rain in QR mode\n  let vis = smoothstep(0.0, 0.3, 1.0 - progress) * rainMode;\n\n  if (vis < 0.01) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let data = rainData[dropIdx];\n  let col = data.x;\n  let row = data.y;\n  let phase = data.z;\n  let seed = data.w;\n\n  let blockSize = f32(" + ke + ");\n  let gridSize = uniforms.gridSize;\n  let halfGrid = gridSize * blockSize * 0.5;\n  let time = uniforms.time;\n\n  let fallSpeed = 1.5 + seed * 1.0;\n  let cycleT = fract((time * fallSpeed + phase * 10.0) * 0.3);\n\n  let topY = blockSize * 45.0;\n  let botY = blockSize * 0.5;\n  let dropY = mix(topY, botY, cycleT);\n\n  // Slight fixed wind angle for rain\n  let windDrift = 0.015 * cycleT;\n\n  let baseX = col * blockSize - halfGrid + windDrift;\n  let baseZ = row * blockSize - halfGrid + 0.008 * cycleT;\n\n  let streakLength = blockSize * (2.5 + seed * 1.5);\n  let streakWidth = blockSize * 0.06;\n\n  let quadVerts = array<vec2f, 6>(\n    vec2f(-1.0, 0.0), vec2f(1.0, 0.0), vec2f(-1.0, 1.0),\n    vec2f(-1.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0)\n  );\n  let qv = quadVerts[localVert];\n\n  let fadeTop = smoothstep(0.0, 0.1, cycleT);\n  let fadeBot = 1.0 - smoothstep(0.85, 1.0, cycleT);\n  output.alpha = fadeTop * fadeBot * vis * (0.06 + seed * 0.05);\n\n  var localPos = vec3f(\n    baseX + qv.x * streakWidth,\n    dropY + qv.y * streakLength,\n    baseZ\n  );\n\n  " + we() + "\n  output.position = vec4f(\n    (ry_x + xOffsetScene) * scaleX,\n    (rx_y + yOffsetScene) * scaleY,\n    rx_z * 0.01 + 0.5,\n    1.0\n  );\n\n  return output;\n}\n",
              fragment: "\n" + ye + "\n\nstruct RainInput {\n  @location(0) alpha: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n@fragment\nfn main(input: RainInput) -> @location(0) vec4f {\n  if (input.alpha < 0.01) { discard; }\n  let color = vec3f(0.72, 0.78, 0.9);\n  return vec4f(color * input.alpha, input.alpha);\n}\n",
              depthWrite: false,
              depthCompare: "less",
              blend: {
                color: {
                  srcFactor: "src-alpha",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add"
                },
                alpha: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add"
                }
              }
            });
          } catch (_0x1e59c2) {
            console.error("Rain pipeline failed (non-fatal):", _0x1e59c2);
          }
          let _0x32fe7e = null;
          try {
            _0x32fe7e = be(_0x2cc8ca, _0x1614a7, _0xc01810, {
              vertex: "\n" + ye + "\n\nstruct ButterflyOutput {\n  @builtin(position) position: vec4f,\n  @location(0) wingT: f32,\n  @location(1) seed: f32,\n  @location(2) wingSide: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n@group(0) @binding(1) var<storage, read> butterflyData: array<vec4f>;\n\nconst PI: f32 = 3.14159265;\n\n@vertex\nfn main(@builtin(vertex_index) vertexIndex: u32) -> ButterflyOutput {\n  var output: ButterflyOutput;\n\n  let vertsPerButterfly = 6u;\n  let bIdx = vertexIndex / vertsPerButterfly;\n  let localVert = vertexIndex % vertsPerButterfly;\n\n  let count = u32(uniforms.blockCount);\n  if (bIdx >= count) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let progress = uniforms.progress;\n  let season = uniforms.season;\n\n  // Summer only (season 1)\n  let summerVis = 1.0 - abs(season - 1.0);\n  let vis = smoothstep(0.0, 0.4, 1.0 - progress) * smoothstep(0.0, 0.5, summerVis);\n  if (vis < 0.01) {\n    output.position = vec4f(0.0, 0.0, -10.0, 1.0);\n    return output;\n  }\n\n  let data = butterflyData[bIdx];\n  let orbitRadius = data.x;\n  let orbitSpeed = data.y;\n  let heightOffset = data.z;\n  let seed = data.w;\n  output.seed = seed;\n\n  let blockSize = f32(" + ke + ");\n  let gridSize = uniforms.gridSize;\n  let halfGrid = gridSize * blockSize * 0.5;\n  let time = uniforms.time;\n\n  // Faster erratic orbit with wobble\n  let phase = seed * PI * 2.0;\n  let orbitAngle = time * orbitSpeed + phase;\n  let wobble = sin(time * 2.5 + seed * 8.0) * 0.3;\n  let bobY = sin(time * 1.8 + seed * 5.0) * blockSize * 2.0;\n\n  let centerCol = gridSize * 0.5 + cos(orbitAngle + wobble) * orbitRadius;\n  let centerRow = gridSize * 0.5 + sin(orbitAngle + wobble) * orbitRadius;\n  let centerY = blockSize * heightOffset + bobY;\n\n  let centerX = centerCol * blockSize - halfGrid;\n  let centerZ = centerRow * blockSize - halfGrid;\n\n  // Direction of travel (tangent to orbit)\n  let dirX = -sin(orbitAngle + wobble);\n  let dirZ = cos(orbitAngle + wobble);\n\n  // Rapid wing flapping — butterfly flutter\n  let flapSpeed = 14.0 + seed * 10.0;\n  let flapAngle = sin(time * flapSpeed + seed * 10.0) * 0.9;\n\n  // Square-ish wings — width ≈ length\n  let wingSpan = blockSize * (0.82 + seed * 0.32) * vis;\n  let wingLength = blockSize * (0.74 + seed * 0.24) * vis;\n\n  // Perpendicular to flight direction (wing axis)\n  let perpX = dirZ;\n  let perpZ = -dirX;\n\n  let isRightWing = localVert >= 3u;\n  let wingVert = localVert % 3u;\n  let wingSign = select(-1.0, 1.0, isRightWing);\n  output.wingSide = wingSign;\n\n  var localPos = vec3f(0.0);\n  output.wingT = 0.0;\n\n  if (wingVert == 0u) {\n    // Body center\n    localPos = vec3f(centerX, centerY, centerZ);\n    output.wingT = 0.0;\n  } else if (wingVert == 1u) {\n    // Front-outer corner — forward + outward\n    let wingUp = sin(flapAngle * wingSign) * wingSpan * 0.7;\n    let wingOut = cos(flapAngle * wingSign) * wingSpan;\n    localPos = vec3f(\n      centerX + perpX * wingOut * wingSign + dirX * wingLength * 0.55,\n      centerY + wingUp,\n      centerZ + perpZ * wingOut * wingSign + dirZ * wingLength * 0.55,\n    );\n    output.wingT = 1.0;\n  } else {\n    // Back-outer corner — backward + outward\n    let wingUp = sin(flapAngle * wingSign) * wingSpan * 0.5;\n    let wingOut = cos(flapAngle * wingSign) * wingSpan * 0.85;\n    localPos = vec3f(\n      centerX + perpX * wingOut * wingSign - dirX * wingLength * 0.55,\n      centerY + wingUp,\n      centerZ + perpZ * wingOut * wingSign - dirZ * wingLength * 0.55,\n    );\n    output.wingT = 0.7;\n  }\n\n  " + we() + "\n  \n  output.position = vec4f(\n    (ry_x + xOffsetScene) * scaleX,\n    (rx_y + yOffsetScene) * scaleY,\n    rx_z * 0.01 + 0.5,\n    1.0\n  );\n\n  return output;\n}\n",
              fragment: "\n" + ye + "\n\nstruct ButterflyInput {\n  @location(0) wingT: f32,\n  @location(1) seed: f32,\n  @location(2) wingSide: f32,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n" + xe + "\n\n@fragment\nfn main(input: ButterflyInput) -> @location(0) vec4f {\n  let seed = input.seed;\n  let t = input.wingT;\n\n  // Bright vivid butterfly colors for summer\n  var wingBase: vec3f;\n  var wingTip: vec3f;\n\n  let tier = fract(seed * 3.17);\n  if (tier < 0.25) {\n    // Electric blue\n    wingBase = vec3f(0.15, 0.40, 0.95);\n    wingTip = vec3f(0.35, 0.65, 1.0);\n  } else if (tier < 0.5) {\n    // Vivid orange monarch\n    wingBase = vec3f(0.95, 0.45, 0.05);\n    wingTip = vec3f(1.0, 0.70, 0.20);\n  } else if (tier < 0.75) {\n    // Bright yellow\n    wingBase = vec3f(0.95, 0.85, 0.15);\n    wingTip = vec3f(1.0, 0.95, 0.50);\n  } else {\n    // Hot pink/magenta\n    wingBase = vec3f(0.90, 0.20, 0.55);\n    wingTip = vec3f(1.0, 0.50, 0.70);\n  }\n\n  var color = mix(wingBase, wingTip, t);\n\n  // Dark wing edge markings\n  let edgeDark = mix(0.6, 1.0, smoothstep(0.0, 0.25, t));\n  color = color * edgeDark;\n\n  // Wing spots — small dark dots\n  let spotChance = fract(seed * 7.3 + t * 3.1);\n  if (spotChance > 0.8 && t > 0.4) {\n    color = color * 0.3;\n  }\n\n  // Bright lighting\n  let ambient = vec3f(0.40, 0.40, 0.42);\n  const sunDir = vec3f(-0.405616, 0.861934, -0.304212);\n  let N = vec3f(0.0, 1.0, 0.0);\n  let NdotL = max(dot(N, sunDir), 0.0);\n  let lit = color * (ambient + vec3f(1.3) * NdotL * 0.8);\n\n  let hdr = acesFilm(lit * 1.8);\n  var ldr = pow(hdr, vec3f(1.0 / 2.2));\n  // Extra saturation boost for vivid butterflies\n  let gray = dot(ldr, vec3f(0.299, 0.587, 0.114));\n  ldr = mix(vec3f(gray), ldr, 2.2);\n\n  return vec4f(ldr, 1.0);\n}\n",
              depthWrite: true,
              depthCompare: "less"
            });
          } catch (_0x395c8a) {
            console.error("Butterfly pipeline failed (non-fatal):", _0x395c8a);
          }
          const _0x4c3382 = _0x2cc8ca.createTexture({
            size: [_0x3965a8.width, _0x3965a8.height],
            format: _0x1614a7,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
          });
          const _0x31132d = _0x4c3382.createView();
          const _0x4ab107 = _0x2cc8ca.createSampler({
            magFilter: "linear",
            minFilter: "linear"
          });
          const _0x298d5e = _0x2cc8ca.createBindGroupLayout({
            entries: [{
              binding: 0,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
              buffer: {
                type: "uniform"
              }
            }, {
              binding: 1,
              visibility: GPUShaderStage.FRAGMENT,
              texture: {
                sampleType: "float"
              }
            }, {
              binding: 2,
              visibility: GPUShaderStage.FRAGMENT,
              sampler: {}
            }]
          });
          const _0x74e167 = _0x2cc8ca.createBindGroup({
            layout: _0x298d5e,
            entries: [{
              binding: 0,
              resource: {
                buffer: _0x3900da
              }
            }, {
              binding: 1,
              resource: _0x31132d
            }, {
              binding: 2,
              resource: _0x4ab107
            }]
          });
          let _0x5c2fd7 = null;
          try {
            const _0x3c9660 = _0x2cc8ca.createShaderModule({
              code: "\n" + ye + "\n\nstruct BlurOut {\n  @builtin(position) position: vec4f,\n  @location(0) uv: vec2f,\n}\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n\n@vertex\nfn main(@builtin(vertex_index) vi: u32) -> BlurOut {\n  var tri = array<vec2f, 3>(\n    vec2f(-1.0, -1.0),\n    vec2f(3.0, -1.0),\n    vec2f(-1.0, 3.0)\n  );\n  let p = tri[vi];\n  var o: BlurOut;\n  o.position = vec4f(p, 1.0, 1.0);\n  o.uv = vec2f(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);\n  return o;\n}\n"
            });
            const _0x48ce8b = _0x2cc8ca.createShaderModule({
              code: "\n" + ye + "\n\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\n@group(0) @binding(1) var sceneTex: texture_2d<f32>;\n@group(0) @binding(2) var sceneSamp: sampler;\n\n@fragment\nfn main(@location(0) uv: vec2f) -> @location(0) vec4f {\n  let progress = uniforms.progress;\n\n  // Blur strength peaks mid-transition, zero at endpoints\n  let strength = sin(progress * 3.14159) * 0.05;\n\n  // Radial direction from center to this pixel\n  let center = vec2f(0.5, 0.5);\n  let dir = (uv - center) * strength;\n\n  // Accumulate 8 samples along the radial direction\n  var color = vec4f(0.0);\n  for (var i = 0u; i < 8u; i++) {\n    let t = f32(i) / 7.0;\n    color += textureSample(sceneTex, sceneSamp, uv - dir * t);\n  }\n  color /= 8.0;\n\n  // Vignette — darken edges proportional to transition intensity\n  let dist = length(uv - center);\n  let vignette = 1.0 - dist * dist * strength * 8.0;\n  color = vec4f(color.rgb * vignette, 1.0);\n\n  return color;\n}\n"
            });
            _0x5c2fd7 = _0x2cc8ca.createRenderPipeline({
              layout: _0x2cc8ca.createPipelineLayout({
                bindGroupLayouts: [_0x298d5e]
              }),
              vertex: {
                module: _0x3c9660,
                entryPoint: "main"
              },
              fragment: {
                module: _0x48ce8b,
                entryPoint: "main",
                targets: [{
                  format: _0x1614a7
                }]
              },
              primitive: {
                topology: "triangle-list",
                cullMode: "none"
              }
            });
          } catch (_0x5f19ff) {
            console.error("Blur pipeline failed (non-fatal):", _0x5f19ff);
          }
          const _0x1a3016 = _0x2cc8ca.createTexture({
            size: [_0x3965a8.width, _0x3965a8.height],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
          });
          return {
            device: _0x2cc8ca,
            context: _0x3f70a1,
            buffers: {
              blockUniforms: _0x3900da,
              branchUniforms: _0x49b52a,
              grassUniforms: _0x46b627,
              petalUniforms: _0x595d58,
              typeBuffer: _0x11bbe2,
              posBuffer: _0x28d692,
              heightBuffer: _0x1476a0,
              baseYBuffer: _0x1261f1,
              flowerBuffer: _0x3021ae,
              branchBuffer: _0x377a4d,
              grassBuffer: _0x2be32b,
              fallingPetalBuffer: _0x59e82c,
              rainUniforms: _0x517713,
              rainBuffer: _0x47a094,
              butterflyUniforms: _0x2df518,
              butterflyBuffer: _0x4ad745
            },
            pipelines: {
              sky: _0xf57c94,
              shadow: _0x59a269,
              blocks: _0xafe3b5,
              flowers: _0x2d4d3b,
              branches: _0x1a172b,
              grass: _0x2f7da1,
              fallingPetals: _0x72f378,
              rain: _0x3bc201,
              butterflies: _0x32fe7e,
              blur: _0x5c2fd7
            },
            bindGroups: {
              sky: _0x10cde2,
              shadow: _0x10cde2,
              blocks: _0x3272ff,
              flowers: _0x4cdd33,
              branches: _0x221957,
              grass: _0x30997a,
              fallingPetals: _0x507dc,
              rain: _0x542379,
              butterflies: _0x1cc244,
              blur: _0x74e167
            },
            depthTexture: _0x1a3016,
            depthTextureView: _0x1a3016.createView(),
            sceneTexture: _0x4c3382,
            sceneTextureView: _0x31132d,
            blurSampler: _0x4ab107,
            blurBindGroupLayout: _0x298d5e,
            aspectRatio: _0x3965a8.width / _0x3965a8.height,
            isMobile: "ontouchstart" in globalThis || navigator.maxTouchPoints > 0,
            counts: {
              numBlocks: 0,
              gridSize: 0,
              flowerCount: 0,
              segmentCount: 0,
              grassCount: 0,
              petalCount: 0,
              rainCount: 0,
              butterflyCount: 0
            },
            _uniformArr: new Float32Array(16),
            _branchUpload: new Float32Array(6000),
            _flowerUpload: new Float32Array(400000),
            _petalUpload: new Float32Array(40),
            _rainUpload: new Float32Array(2000),
            _butterflyUpload: new Float32Array(40)
          };
        }(_0x3404a9, _0x1b3318, _0x1f69fa);
        if (!_0x2c9dd9) {
          if (!disposed.current) _0xed4da.onError();
          return;
        }
        if (disposed.current) { _0x2c9dd9.device.destroy(); return; }
        _0xed4da.onReady();
        _0x27739d.current = _0x2c9dd9;
        _0x6f8fc9.current = _0x3404a9;
        const _0xed02d6 = ee(_0x2323cd.current);
        const _0x4f57c1 = ae(_0xed02d6);
        const _0x3921ec = ie(_0xed02d6);
        _0x43f2cb.current = _0xed02d6;
        _0x28866d.current = _0x3921ec;
        _0x4531f4.current = _0x4f57c1.gridSize;
        oe(Ee(_0x5399fb.current));
        const _0x654dac = se(_0x3921ec, _0x4f57c1.gridSize);
        const _0x2149ca = ue(_0x654dac.tips, _0x3921ec);
        const _0x22d346 = ce(_0xed02d6);
        const _0x4d367f = fe(_0x4f57c1.gridSize, _0xed02d6);
        const _0x30e59c = de(_0x654dac.tips, _0x4f57c1.gridSize);
        const _0x5dc1c4 = pe(_0x4f57c1.gridSize);
        const _0x41ff9f = he(_0x4f57c1.gridSize);
        Se(_0x2c9dd9, _0x4f57c1, _0x654dac, _0x2149ca, _0x22d346.positions, _0x22d346.count, _0x4d367f, _0x30e59c, _0x5dc1c4, _0x41ff9f);
        _0x4e7fe7.current = _0x2323cd.current;
        let _0x42fa71 = -1;
        let _0xdd66a6 = "";
        let _0x2a658b = "";
        let _0x1fb690 = 0;
        let _0x4a09eb = 0;
        let _0x422c2b = false;
        const _0x318264 = () => {
          if (!_0x1ddb2b) {
            return;
          }
          if (_0x4e7fe7.current !== _0x2323cd.current) {
            return;
          }
          const _0x7ae42c = _0x2728d7.current.join(",");
          const _0xc795fa = _0x3404a9.width;
          const _0x15124f = _0x3404a9.height;
          const _0x3fc7b1 = _0x1fb690 !== _0xc795fa || _0x4a09eb !== _0x15124f;
          const _0x4f601d = _0x42fa71 !== _0x45ded0.current || _0xdd66a6 !== _0x7ae42c || _0x2a658b !== _0x2323cd.current;
          if (!_0x3fc7b1 && !_0x4f601d && !_0x422c2b) {
            return;
          }
          if (_0x3fc7b1 && _0x1fb690 > 0) {
            _0x1fb690 = _0xc795fa;
            _0x4a09eb = _0x15124f;
            _0x1ddb2b.current = "";
            _0x1e3edc?.current?.("");
            _0x422c2b = true;
            return;
          }
          _0x422c2b = false;
          _0x42fa71 = _0x45ded0.current;
          _0xdd66a6 = _0x7ae42c;
          _0x2a658b = _0x2323cd.current;
          _0x1fb690 = _0xc795fa;
          _0x4a09eb = _0x15124f;
          const _0x1f741d = _0x45ded0.current === 2 ? 1 : 0;
          Ce(_0x2c9dd9, {
            time: 0,
            progress: 1,
            season: _0x45ded0.current,
            cameraBobX: 0,
            cameraBobY: 0,
            burstTime: 0,
            customR: _0x2728d7.current[0],
            customG: _0x2728d7.current[1],
            customB: _0x2728d7.current[2],
            customStrength: _0x2728d7.current[3],
            rainMode: _0x1f741d,
            trunkSeed: _0x5dd6ef
          });
          // Render a mature tree for the share image, independently of the live camera.
          Ce(_0x2c9dd9, { time: 8, progress: 0, season: _0x45ded0.current,
            cameraBobX: 0, cameraBobY: 0, burstTime: 0,
            customR: 0, customG: 0, customB: 0, customStrength: 0,
            rainMode: 0, trunkSeed: _0x5dd6ef });
          const _0x429fa1 = document.createElement("canvas");
          _0x429fa1.width = _0xc795fa;
          _0x429fa1.height = _0x15124f;
          const _0x31335f = _0x429fa1.getContext("2d");
          if (_0x31335f) {
            _0x31335f.drawImage(_0x3404a9, 0, 0);
            const _0x3b0cfe = _0x429fa1.toDataURL("image/png");
            _0x1ddb2b.current = _0x3b0cfe;
            _0x1e3edc?.current?.(_0x3b0cfe);
          }
        };
        setTimeout(_0x318264, 50);
        let _0x2f7bba = false;
        const _0x363ece = () => {
          const _0x3136b0 = Date.now();
          const _0x4c30 = Math.min((_0x3136b0 - _0x5b6917.current) / 1000, 0.05);
          _0x5b6917.current = _0x3136b0;
          const _0x1574de = _0x357820.current ? 1 : 0;
          var _0x3fbddf;
          _0x2c7cf4.current += (_0x1574de - _0x2c7cf4.current) * Math.min(1, _0x4c30 * 3.5);
          if (Math.abs(_0x2c7cf4.current - _0x1574de) < 0.001) {
            _0x2c7cf4.current = _0x1574de;
          }
          _0x4c7277.current = (_0x3fbddf = _0x2c7cf4.current) < 0.5 ? _0x3fbddf * 4 * _0x3fbddf * _0x3fbddf : 1 - (_0x3fbddf * -2 + 2) ** 3 / 2;
          const _0x502b59 = _0x2c7cf4.current >= 0.9 && _0x1574de === 1;
          if (_0x502b59 !== _0x2f7bba) {
            _0x2f7bba = _0x502b59;
            _0x3d1546?.current?.(_0x502b59);
          }
          const _0x505c2a = (_0x3136b0 - _0x366195.current) / 1000;
          const _0x5a9357 = _0x4c7277.current;
          const _0x1441a0 = 1 - _0x5a9357;
          const _0x1b5312 = _0x505c2a - _0x38b120.current;
          const _0x5944f9 = Math.exp(-_0x1b5312 * 6) * Math.sin(_0x1b5312 * 12) * 0.008;
          const _0x31d89e = Math.sin(_0x505c2a * 0.15) * 0.003 * _0x1441a0;
          const _0x38fea0 = Math.sin(_0x505c2a * 0.11 + 1) * 0.002 * _0x1441a0 + _0x5944f9;
          if (_0x357820.current !== _0x518aa4.current) {
            _0x518aa4.current = _0x357820.current;
            _0x38b120.current = _0x505c2a;
          }
          const _0x55604a = _0x45ded0.current === 2 ? 1 : 0;
          _0x4d86e9.current += (_0x55604a - _0x4d86e9.current) * Math.min(1, _0x4c30 * 3);
          if (Math.abs(_0x4d86e9.current - _0x55604a) < 0.001) {
            _0x4d86e9.current = _0x55604a;
          }
          if (_0x45ded0.current !== _0x26693f.current && _0x28866d.current) {
            _0x26693f.current = _0x45ded0.current;
            oe(Ee(_0x5399fb.current));
            const _0x59e81c = _0x28866d.current;
            const _0x383b6a = _0x4531f4.current;
            const _0x3b2897 = se(_0x59e81c, _0x383b6a);
            const _0x562106 = ue(_0x3b2897.tips, _0x59e81c);
            const _0x78bced = ce(_0x43f2cb.current);
            const _0x5a0aee = de(_0x3b2897.tips, _0x383b6a);
            (function (_0x25e6b7, _0x5bbbd2, _0xc89383, _0x1fa980, _0x30cbc0, _0x4870d4) {
              const {
                device: _0x5baf85,
                buffers: _0x1be70e
              } = _0x25e6b7;
              const _0x642403 = _0x25e6b7._branchUpload;
              _0x642403.fill(0);
              _0x642403.set(_0x5bbbd2.segments);
              _0x5baf85.queue.writeBuffer(_0x1be70e.branchBuffer, 0, _0x642403);
              _0x25e6b7.counts.segmentCount = _0x5bbbd2.segmentCount;
              const _0x5721af = _0xc89383.count + _0x30cbc0;
              const _0x3931ee = _0x25e6b7._flowerUpload;
              _0x3931ee.fill(0);
              _0x3931ee.set(_0xc89383.positions);
              for (let _0x11f1b6 = 0; _0x11f1b6 < _0x30cbc0 * 4; _0x11f1b6++) {
                _0x3931ee[_0xc89383.count * 4 + _0x11f1b6] = _0x1fa980[_0x11f1b6];
              }
              _0x5baf85.queue.writeBuffer(_0x1be70e.flowerBuffer, 0, _0x3931ee);
              _0x25e6b7.counts.flowerCount = _0x5721af;
              const _0x5c2e98 = _0x25e6b7._petalUpload;
              _0x5c2e98.fill(0);
              _0x5c2e98.set(_0x4870d4.positions);
              _0x5baf85.queue.writeBuffer(_0x1be70e.fallingPetalBuffer, 0, _0x5c2e98);
              _0x25e6b7.counts.petalCount = _0x4870d4.count;
            })(_0x2c9dd9, _0x3b2897, _0x562106, _0x78bced.positions, _0x78bced.count, _0x5a0aee);
          }
          _0x318264();
          Ce(_0x2c9dd9, {
            time: _0x505c2a,
            progress: _0x5a9357,
            season: _0x45ded0.current,
            cameraBobX: _0x31d89e,
            cameraBobY: _0x38fea0,
            burstTime: _0x38b120.current,
            customR: _0x2728d7.current[0],
            customG: _0x2728d7.current[1],
            customB: _0x2728d7.current[2],
            customStrength: _0x2728d7.current[3],
            rainMode: _0x4d86e9.current,
            trunkSeed: _0x5dd6ef
          });
          _0x41e5ac.current = requestAnimationFrame(_0x363ece);
        };
        _0x363ece();
      } catch (_0x3ed1c9) {
        if (!disposed.current) _0xed4da.onError();
      } finally {
        _0x9a37bd.current = false;
      }
    }, [_0x1b3318, _0x1f69fa, _0xc8ac50, _0x357820, _0x45ded0, _0x2728d7, _0x5399fb, _0x1ddb2b, _0x3d1546, _0x1e3edc]);
    (0, m.useEffect)(() => {
      const _0x20486e = setTimeout(_0x354f89, 100);
      return () => {
        clearTimeout(_0x20486e);
      };
    }, [_0x354f89, _0x1b3318, _0x1f69fa]);
    (0, m.useEffect)(() => {
      const _0x4d722f = _0xc8ac50.current;
      if (!!_0x4d722f && !(_0x1b3318 <= 0) && !(_0x1f69fa <= 0)) {
        if (_0x27739d.current && _0x6f8fc9.current !== _0x4d722f) {
          if (_0x41e5ac.current) {
            cancelAnimationFrame(_0x41e5ac.current);
            _0x41e5ac.current = null;
          }
          _0x27739d.current = null;
          _0x6f8fc9.current = null;
          _0x366195.current = Date.now();
          _0x5b6917.current = Date.now();
        }
        if (!_0x27739d.current) {
          _0x354f89();
        }
      }
    });
    (0, m.useEffect)(() => {
      const _0x45bb31 = _0x27739d.current;
      const _0x5c9186 = _0xc8ac50.current;
      if (_0x45bb31 && _0x5c9186) {
        if (!(_0x1b3318 <= 0) && !(_0x1f69fa <= 0)) {
          (function (_0x82808b, _0x5deeb4, _0x14b74c, _0x4a6a56) {
            const _0x141c8b = Math.min(window.devicePixelRatio || 1, 2);
            const _0x40cedb = Math.max(1, Math.floor(_0x14b74c * _0x141c8b));
            const _0x53e645 = Math.max(1, Math.floor(_0x4a6a56 * _0x141c8b));
            if (_0x5deeb4.width === _0x40cedb && _0x5deeb4.height === _0x53e645) {
              return;
            }
            _0x5deeb4.width = _0x40cedb;
            _0x5deeb4.height = _0x53e645;
            _0x82808b.context.configure({
              device: _0x82808b.device,
              format: navigator.gpu.getPreferredCanvasFormat(),
              alphaMode: "premultiplied"
            });
            _0x82808b.depthTexture.destroy();
            _0x82808b.depthTexture = _0x82808b.device.createTexture({
              size: [_0x5deeb4.width, _0x5deeb4.height],
              format: "depth24plus",
              usage: GPUTextureUsage.RENDER_ATTACHMENT
            });
            _0x82808b.depthTextureView = _0x82808b.depthTexture.createView();
            _0x82808b.sceneTexture.destroy();
            const _0x52eccf = navigator.gpu.getPreferredCanvasFormat();
            _0x82808b.sceneTexture = _0x82808b.device.createTexture({
              size: [_0x5deeb4.width, _0x5deeb4.height],
              format: _0x52eccf,
              usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            });
            _0x82808b.sceneTextureView = _0x82808b.sceneTexture.createView();
            _0x82808b.bindGroups.blur = _0x82808b.device.createBindGroup({
              layout: _0x82808b.blurBindGroupLayout,
              entries: [{
                binding: 0,
                resource: {
                  buffer: _0x82808b.buffers.blockUniforms
                }
              }, {
                binding: 1,
                resource: _0x82808b.sceneTextureView
              }, {
                binding: 2,
                resource: _0x82808b.blurSampler
              }]
            });
            _0x82808b.aspectRatio = _0x5deeb4.width / _0x5deeb4.height;
          })(_0x45bb31, _0x5c9186, _0x1b3318, _0x1f69fa);
        }
      }
    }, [_0x1b3318, _0x1f69fa, _0xc8ac50]);
    (0, m.useEffect)(() => () => {
      disposed.current = true;
      _0x27739d.current?.device.destroy();
      if (_0x41e5ac.current) {
        cancelAnimationFrame(_0x41e5ac.current);
      }
    }, []);

}
