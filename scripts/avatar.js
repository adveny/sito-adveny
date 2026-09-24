// Avatar del team: scontorno (Vision di macOS, in locale), bianco e nero virato, ritaglio 4:5 → PNG trasparente 900×1125.
// Uso: osascript -l JavaScript scripts/avatar.js foto.jpg out.png 0.96 0.03  (larghezza del ritaglio, margine sopra, in frazioni della foto)
// Poi convertire in WebP (es. con sharp) in public/img/team/.
ObjC.import('Foundation'); ObjC.import('Vision'); ObjC.import('CoreImage'); ObjC.import('AppKit')
function run(argv) {
  const [inp, out, wFrac, topFrac] = argv
  const url = $.NSURL.fileURLWithPath(inp)
  const opts = $.NSDictionary.dictionaryWithObjectForKey($.NSNumber.numberWithBool(true), 'kCIImageApplyOrientationProperty')
  const src = $.CIImage.imageWithContentsOfURLOptions(url, opts)
  const handler = $.VNImageRequestHandler.alloc.initWithCIImageOptions(src, $.NSDictionary.dictionary)
  const req = $.VNGenerateForegroundInstanceMaskRequest.alloc.init
  const err = Ref()
  if (!handler.performRequestsError($.NSArray.arrayWithObject(req), err)) return 'errore vision'
  const obs = req.results.firstObject
  if (!obs || obs.isNil()) return 'nessun soggetto'
  // maschera in scala di grigi alla risoluzione della foto: i toni si lavorano sulla foto
  // intera e la maschera si applica per ultima (niente aloni chiari sui bordi dei capelli)
  const maskBuf = obs.generateScaledMaskForImageForInstancesFromRequestHandlerError(obs.allInstances, handler, err)
  const mask = $.CIImage.imageWithCVPixelBuffer(maskBuf)
  let img = src
  const f = (name, pairs) => { const fl = $.CIFilter.filterWithName(name); fl.setDefaults; for (const [k, v] of pairs) fl.setValueForKey(v, k); return fl.outputImage }
  const mono = f('CIColorControls', [['inputImage', img], ['inputSaturation', $.NSNumber.numberWithDouble(0)], ['inputContrast', $.NSNumber.numberWithDouble(1.12)], ['inputBrightness', $.NSNumber.numberWithDouble(0.03)]])
  const lift = f('CIGammaAdjust', [['inputImage', mono], ['inputPower', $.NSNumber.numberWithDouble(0.72)]])
  const tone = f('CIFalseColor', [['inputImage', lift], ['inputColor0', $.CIColor.colorWithRedGreenBlue(0.05, 0.03, 0.10)], ['inputColor1', $.CIColor.colorWithRedGreenBlue(0.97, 0.95, 1.0)]])
  let res = f('CIBlendWithMask', [['inputImage', tone], ['inputBackgroundImage', $.CIImage.emptyImage], ['inputMaskImage', mask]])
  const ext = src.extent, W = ext.size.width, H = ext.size.height
  const cw = W * parseFloat(wFrac), ch = cw * 5 / 4, cx = W * 0.5 - cw / 2, top = H * parseFloat(topFrac)
  const rect = $.CGRectMake(cx, H - top - ch, cw, ch)
  res = res.imageByCroppingToRect(rect).imageByApplyingTransform($.CGAffineTransformMakeTranslation(-cx, -(H - top - ch)))
  const s = 900 / cw
  res = res.imageByApplyingTransform($.CGAffineTransformMakeScale(s, s))
  const ctx = $.CIContext.contextWithOptions($())
  const cs = $.CGColorSpaceCreateWithName($.kCGColorSpaceSRGB)
  const ok = ctx.writePNGRepresentationOfImageToURLFormatColorSpaceOptionsError(res, $.NSURL.fileURLWithPath(out), $.kCIFormatRGBA8, cs, $.NSDictionary.dictionary, err)
  return ok ? 'ok ' + out : 'errore png'
}
