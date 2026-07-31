package com.bjtumarket.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

/**
 * S5.1/S5.2 — PDF 实习证明生成 + 防伪水印
 */
@Service
public class CertificateService {

    public byte[] generateCertificatePdf(Map<String, Object> data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document document = new Document(pdfDoc, PageSize.A4)) {

            // === S5.2 防伪水印：淡灰底色 ===
            pdfDoc.addNewPage();
            PdfCanvas canvas = new PdfCanvas(pdfDoc.getFirstPage());
            canvas.saveState();
            PdfExtGState gs = new PdfExtGState().setFillOpacity(0.08f);
            canvas.setExtGState(gs);
            canvas.setFillColor(ColorConstants.LIGHT_GRAY);
            canvas.rectangle(0, 0, PageSize.A4.getWidth(), PageSize.A4.getHeight());
            canvas.fill();
            canvas.restoreState();

            // 对角线水印文字
            canvas.saveState();
            gs = new PdfExtGState().setFillOpacity(0.05f);
            canvas.setExtGState(gs);
            canvas.setFillColor(ColorConstants.BLACK);
            canvas.beginText();
            canvas.setFontAndSize(PdfFontFactory.createFont(), 48);
            for (float y = 0; y < PageSize.A4.getHeight(); y += 120) {
                for (float x = 0; x < PageSize.A4.getWidth(); x += 250) {
                    canvas.setTextMatrix(x, y);
                    canvas.showText("校园集市 · 实习证明");
                }
            }
            canvas.endText();
            canvas.restoreState();

            // === 正文内容 ===
            String studentName = getStr(data, "studentName");
            String studentMajor = getStr(data, "studentMajor");
            String studentGrade = getStr(data, "studentGrade");
            String companyName = getStr(data, "companyName");
            String position = getStr(data, "position");
            String startDate = getStr(data, "startDate");
            String endDate = getStr(data, "endDate");
            Object ratingObj = data.get("rating");
            String rating = ratingObj != null ? ratingObj.toString() : "-";
            String review = getStr(data, "review");

            // 标题
            Paragraph title = new Paragraph()
                .add(new Text("实习证明").setFontSize(26).setBold())
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(30);
            document.add(title);

            // 正文
            StringBuilder body = new StringBuilder();
            body.append("兹证明 ").append(studentName).append(" 同学，");
            if (studentMajor != null && !studentMajor.isEmpty()) {
                body.append("系 ").append(studentMajor).append(" 专业");
                if (studentGrade != null && !studentGrade.isEmpty()) {
                    body.append(studentGrade).append(" 级");
                }
            }
            body.append("学生。\n\n");
            body.append("该生自 ").append(startDate).append(" 至 ").append(endDate);
            body.append(" 在 ").append(companyName).append(" 完成实习，");
            body.append("实习岗位为 ").append(position).append("。\n\n");
            body.append("实习期间表现评级：").append(rating).append(" / 5\n");
            if (review != null && !review.isEmpty()) {
                body.append("企业评语：").append(review).append("\n");
            }

            Paragraph content = new Paragraph()
                .add(new Text(body.toString()).setFontSize(12))
                .setTextAlignment(TextAlignment.LEFT)
                .setMarginBottom(30)
                .setFixedLeading(24);
            document.add(content);

            // 底部信息
            Paragraph footer = new Paragraph()
                .add(new Text("校园集市 · 实习管理平台").setFontSize(10).setFontColor(ColorConstants.GRAY))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(50);
            document.add(footer);

            // 验证链接
            String certId = getStr(data, "internshipId");
            String verifyUrl = "验证链接：/api/internship/verify/" + certId;
            Paragraph verify = new Paragraph()
                .add(new Text(verifyUrl).setFontSize(8).setFontColor(ColorConstants.LIGHT_GRAY))
                .setTextAlignment(TextAlignment.CENTER);
            document.add(verify);

        } catch (IOException e) {
            throw new RuntimeException("生成 PDF 失败", e);
        }

        return baos.toByteArray();
    }

    private String getStr(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : "";
    }
}
