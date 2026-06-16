import { NextRequest } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, telefono, servicio, fecha, hora, notas } = body as {
      nombre: string
      telefono: string
      servicio: string
      fecha: string
      hora: string
      notas?: string
    }

    if (!nombre || !telefono || !servicio || !fecha || !hora) {
      return Response.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"NUDO Salón de Belleza" <${process.env.EMAIL_USER}>`,
      to: 'franco.landac@gmail.com',
      subject: `Nueva cita — ${nombre} · ${servicio}`,
      html: buildEmailHtml({ nombre, telefono, servicio, fecha, hora, notas }),
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error al enviar correo:', error)
    return Response.json({ error: 'Error al enviar el correo' }, { status: 500 })
  }
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="color:#9CA3AF;padding:12px 0;font-size:13px;width:130px;vertical-align:top;border-bottom:1px solid rgba(255,255,255,0.05);">${label}</td>
      <td style="color:#F5F5F5;padding:12px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05);">${value}</td>
    </tr>
  `
}

function buildEmailHtml({
  nombre, telefono, servicio, fecha, hora, notas,
}: {
  nombre: string
  telefono: string
  servicio: string
  fecha: string
  hora: string
  notas?: string
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:20px;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#0A0A0A;border-radius:8px;overflow:hidden;border:1px solid rgba(212,104,143,0.2);">
        <div style="padding:40px;text-align:center;background:linear-gradient(135deg,#0A0A0A 0%,#120F00 100%);border-bottom:1px solid rgba(212,104,143,0.25);">
          <h1 style="margin:0;font-size:34px;font-weight:300;color:#D4688F;letter-spacing:12px;">NUDO</h1>
          <p style="margin:8px 0 0;color:#6B7280;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Salón de Belleza</p>
        </div>
        <div style="padding:36px 40px;">
          <h2 style="color:#F5F5F5;font-size:17px;font-weight:400;margin:0 0 24px;letter-spacing:0.5px;">Nueva cita agendada</h2>
          <table style="width:100%;border-collapse:collapse;">
            ${row('Nombre', nombre)}
            ${row('Teléfono', telefono)}
            ${row('Servicio', servicio)}
            ${row('Fecha', fecha)}
            ${row('Hora', hora)}
            ${notas ? row('Notas', notas) : ''}
          </table>
        </div>
        <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
          <p style="margin:0;color:#374151;font-size:11px;letter-spacing:1px;">NUDO Salón de Belleza · Tu estilo, nuestra pasión</p>
        </div>
      </div>
    </body>
    </html>
  `
}
