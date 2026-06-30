/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UploadValidationService } from './upload-validation.service';

const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');
const htmlBuffer = Buffer.from('<html><script>alert(1)</script></html>');

function multerFile(name: string, mimetype: string, buffer: Buffer, size = buffer.length) {
  return {
    fieldname: 'file',
    originalname: name,
    encoding: '7bit',
    mimetype,
    size,
    buffer,
  } as Express.Multer.File;
}

describe('UploadValidationService', () => {
  const service = new UploadValidationService();

  it('rejeita arquivo vazio ou ausente', async () => {
    await assert.rejects(
      () => service.validate(undefined, { context: 'client_file', clientId: 'client-1', actorType: 'CLIENT' }),
      /Arquivo obrigatorio/,
    );
  });

  it('rejeita extensoes perigosas mesmo quando o MIME parece permitido', async () => {
    const blockedExtensions = ['.exe', '.js', '.html', '.svg', '.zip', '.env'];

    for (const extension of blockedExtensions) {
      await assert.rejects(
        () =>
          service.validate(multerFile(`malicious${extension}`, 'application/pdf', pdfBuffer), {
            context: 'client_file',
            clientId: 'client-1',
            actorType: 'CLIENT',
          }),
        /bloqueada|nao permitida/,
      );
    }
  });

  it('rejeita extensao nao permitida pelo contexto', async () => {
    await assert.rejects(
      () =>
        service.validate(multerFile('documento.pdf', 'application/pdf', pdfBuffer), {
          context: 'avatar',
          actorType: 'CLIENT',
        }),
      /Extensao nao permitida/,
    );
  });

  it('rejeita MIME informado fora da politica', async () => {
    await assert.rejects(
      () =>
        service.validate(multerFile('documento.pdf', 'text/plain', pdfBuffer), {
          context: 'client_file',
          clientId: 'client-1',
          actorType: 'CLIENT',
        }),
      /MIME type informado/,
    );
  });

  it('rejeita magic bytes incompativeis e arquivo malicioso renomeado', async () => {
    await assert.rejects(
      () =>
        service.validate(multerFile('contrato.pdf', 'application/pdf', htmlBuffer), {
          context: 'client_file',
          clientId: 'client-1',
          actorType: 'CLIENT',
        }),
      /validar o tipo real/,
    );
  });

  it('rejeita arquivo acima do limite do contexto', async () => {
    await assert.rejects(
      () =>
        service.validate(multerFile('grande.pdf', 'application/pdf', pdfBuffer, 11 * 1024 * 1024), {
          context: 'client_file',
          clientId: 'client-1',
          actorType: 'CLIENT',
        }),
      /excede o limite/,
    );
  });

  it('rejeita admin sem clientId em contexto do portal', async () => {
    await assert.rejects(
      () =>
        service.validate(multerFile('documento.pdf', 'application/pdf', pdfBuffer), {
          context: 'client_file',
          actorType: 'ADMIN',
        }),
      /clientId obrigatorio/,
    );
  });

  it('aceita arquivo valido e retorna nome seguro', async () => {
    const validated = await service.validate(multerFile('../../contrato<script>.pdf', 'application/pdf', pdfBuffer), {
      context: 'client_file',
      clientId: 'client-1',
      actorType: 'CLIENT',
    });

    assert.equal(validated.detectedMime, 'application/pdf');
    assert.equal(validated.names.extension, '.pdf');
    assert.match(validated.names.safeName, /^contrato-script_[0-9a-f-]+\.pdf$/);
  });

  it('aceita imagem valida para avatar', async () => {
    const validated = await service.validate(multerFile('avatar.png', 'image/png', pngBuffer), {
      context: 'avatar',
      clientId: 'client-1',
      actorType: 'CLIENT',
    });

    assert.equal(validated.detectedMime, 'image/png');
  });

  it('aceita alias image/jpg para imagem de blog valida', async () => {
    const jpegBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
      0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xd9,
    ]);

    const validated = await service.validate(multerFile('capa.jpg', 'image/jpg', jpegBuffer), {
      context: 'blog_cover',
      actorType: 'ADMIN',
    });

    assert.equal(validated.providedMime, 'image/jpeg');
    assert.equal(validated.detectedMime, 'image/jpeg');
  });

  it('aceita .jfif para imagem interna/background do blog', async () => {
    const jfifBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
      0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xd9,
    ]);

    const validated = await service.validate(multerFile('background.jfif', 'image/jpeg', jfifBuffer), {
      context: 'blog_hero',
      actorType: 'ADMIN',
    });

    assert.equal(validated.names.extension, '.jfif');
    assert.equal(validated.detectedMime, 'image/jpeg');
  });

  it('rejeita cliente tentando usar contexto administrativo de blog', async () => {
    await assert.rejects(
      () =>
        service.validate(multerFile('capa.png', 'image/png', pngBuffer), {
          context: 'blog_cover',
          actorType: 'CLIENT',
        }),
      /Clientes nao podem enviar/,
    );
  });

  it('rejeita publico tentando usar contexto administrativo de blog', async () => {
    await assert.rejects(
      () =>
        service.validate(multerFile('capa.png', 'image/png', pngBuffer), {
          context: 'blog_cover',
          actorType: 'PUBLIC',
        }),
      /Upload publico nao permitido/,
    );
  });

  it('aceita formatos amplos para admin em arquivos do portal', async () => {
    const samples = [
      multerFile('entrega.zip', 'application/zip', Buffer.from([0x50, 0x4b, 0x03, 0x04])),
      multerFile('layout.svg', 'image/svg+xml', Buffer.from('<svg viewBox="0 0 1 1"></svg>')),
      multerFile('tokens.json', 'application/json', Buffer.from('{"brand":"ateliux"}')),
      multerFile('design.psd', 'application/octet-stream', Buffer.from('8BPS\x00\x01')),
    ];

    for (const sample of samples) {
      const validated = await service.validate(sample, {
        context: 'client_file',
        clientId: 'client-1',
        actorType: 'ADMIN',
      });

      assert.equal(validated.names.originalName, sample.originalname);
      assert.ok(validated.names.extension);
    }
  });

  it('aceita admin com MIME desconhecido quando file-type nao detecta magic bytes', async () => {
    const validated = await service.validate(multerFile('referencia.fig', '', Buffer.from('figma-source')), {
      context: 'preview_asset',
      clientId: 'client-1',
      actorType: 'ADMIN',
    });

    assert.equal(validated.providedMime, 'application/octet-stream');
    assert.equal(validated.detectedMime, null);
  });
});
