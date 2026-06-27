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
      () => service.validate(undefined, { context: 'client_file', clientId: 'client-1', actorType: 'client' }),
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
            actorType: 'client',
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
          actorType: 'client',
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
          actorType: 'client',
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
          actorType: 'client',
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
          actorType: 'client',
        }),
      /excede o limite/,
    );
  });

  it('rejeita admin sem clientId em contexto do portal', async () => {
    await assert.rejects(
      () =>
        service.validate(multerFile('documento.pdf', 'application/pdf', pdfBuffer), {
          context: 'client_file',
          actorType: 'admin',
        }),
      /clientId obrigatorio/,
    );
  });

  it('aceita arquivo valido e retorna nome seguro', async () => {
    const validated = await service.validate(multerFile('../../contrato<script>.pdf', 'application/pdf', pdfBuffer), {
      context: 'client_file',
      clientId: 'client-1',
      actorType: 'client',
    });

    assert.equal(validated.detectedMime, 'application/pdf');
    assert.equal(validated.names.extension, '.pdf');
    assert.match(validated.names.safeName, /^contrato-script_[0-9a-f-]+\.pdf$/);
  });

  it('aceita imagem valida para avatar', async () => {
    const validated = await service.validate(multerFile('avatar.png', 'image/png', pngBuffer), {
      context: 'avatar',
      clientId: 'client-1',
      actorType: 'client',
    });

    assert.equal(validated.detectedMime, 'image/png');
  });
});
